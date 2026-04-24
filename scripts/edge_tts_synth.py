#!/usr/bin/env python3
"""Synthesise one TTS clip via Microsoft's edge-tts service and write the MP3.

Wraps the upstream `edge-tts` Python package (https://github.com/rany2/edge-tts)
so the Node.js sprite generator can shell out to it. We control the TLS context
explicitly here because the host runs behind a corporate proxy whose root CA is
not in Python's default trust store; aiohttp does not read REQUESTS_CA_BUNDLE,
so the wrapper either:
  - loads SSL_CERT_FILE / EDGE_TTS_CA_BUNDLE / REQUESTS_CA_BUNDLE if present, OR
  - falls back to certifi when available, OR
  - disables verification when EDGE_TTS_INSECURE=1 (last resort).

Args:
  --voice    edge-tts voice id (e.g. vi-VN-NamMinhNeural)
  --text     text to synthesise
  --rate     prosody rate, e.g. -15%
  --output   path to write the resulting MP3
"""

from __future__ import annotations

import argparse
import asyncio
import os
import ssl
import sys
from pathlib import Path

import aiohttp


def build_ssl_context() -> ssl.SSLContext:
    # Behind the corporate proxy in this dev box. edge-tts pins its own SSL
    # context (created from certifi's CA bundle), so we *must* override that
    # module-level constant before importing edge-tts. Otherwise the WebSocket
    # to speech.platform.bing.com fails with CERTIFICATE_VERIFY_FAILED.
    if os.environ.get("EDGE_TTS_INSECURE") == "1":
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        return ctx

    bundle = (
        os.environ.get("EDGE_TTS_CA_BUNDLE")
        or os.environ.get("SSL_CERT_FILE")
        or os.environ.get("REQUESTS_CA_BUNDLE")
        or os.environ.get("AWS_CA_BUNDLE")
    )
    if bundle and Path(bundle).is_file():
        return ssl.create_default_context(cafile=bundle)

    try:
        import certifi

        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


# Patch edge-tts's hardcoded SSL context BEFORE importing edge_tts symbols
# so the rebound ssl context is used by both the WebSocket and the DRM token
# fetch helper.
_PATCHED_CTX = build_ssl_context()
import edge_tts.communicate as _ec  # noqa: E402

_ec._SSL_CTX = _PATCHED_CTX
import edge_tts  # noqa: E402


async def synth(text: str, voice: str, rate: str, output: Path) -> None:
    connector = aiohttp.TCPConnector(ssl=_PATCHED_CTX)
    try:
        comm = edge_tts.Communicate(text, voice, rate=rate, connector=connector)
        with output.open("wb") as fh:
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    fh.write(chunk["data"])
    finally:
        await connector.close()

    if output.stat().st_size == 0:
        # edge-tts returned an empty stream, which usually means a transient
        # service hiccup. Surface a clean signal to the caller so it can retry.
        output.unlink(missing_ok=True)
        raise SystemExit(2)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--voice", required=True)
    parser.add_argument("--text", required=True)
    parser.add_argument("--rate", default="+0%")
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    try:
        asyncio.run(synth(args.text, args.voice, args.rate, output_path))
    except SystemExit:
        raise
    except Exception as exc:  # pylint: disable=broad-except
        print(f"edge_tts_synth: {exc.__class__.__name__}: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
