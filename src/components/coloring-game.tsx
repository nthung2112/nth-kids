import { useEffect, useRef, useState } from "react";

import { Download, Eraser, Eye, EyeOff, HelpCircle, Palette, RotateCcw, Save, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import GameTutorial from "@/components/games/game-tutorial";
import { COLORING_EXAMPLES } from "@/components/games/tutorial-examples";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { COLOR_DEFS, COLOR_PALETTE_IDS, type ColorId } from "@/data/colors";
import { COLORING_TEMPLATES } from "@/data/coloringTemplates";
import { useSound } from "@/hooks/useSound";

const GALLERY_KEY = "nthkids:coloring-gallery";
const GALLERY_LIMIT = 6;

interface GalleryEntry {
  id: string;
  templateId: string;
  paths: { [key: number]: string };
  savedAt: number;
}

const loadGallery = (): GalleryEntry[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(GALLERY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as GalleryEntry[];
  } catch {
    return [];
  }
};

const saveGallery = (entries: GalleryEntry[]) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(GALLERY_KEY, JSON.stringify(entries));
  } catch {
    // ignore storage errors
  }
};

export default function ColoringGame() {
  const { t } = useTranslation();
  const { playColorSound } = useSound();
  const [selectedHex, setSelectedHex] = useState(COLOR_DEFS[COLOR_PALETTE_IDS[0]].hex);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [coloredPaths, setColoredPaths] = useState<{ [key: number]: string }>({});
  const [isErasing, setIsErasing] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showReference, setShowReference] = useState(false);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [savedFlash, setSavedFlash] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setGallery(loadGallery());
  }, []);

  const handleColorSelect = (colorId: ColorId, hex: string) => {
    playColorSound(colorId);
    setSelectedHex(hex);
    setIsErasing(false);
  };

  const handlePathClick = (pathIndex: number) => {
    if (isErasing) {
      const next = { ...coloredPaths };
      delete next[pathIndex];
      setColoredPaths(next);
    } else {
      setColoredPaths({ ...coloredPaths, [pathIndex]: selectedHex });
    }
  };

  const clearAll = () => {
    setColoredPaths({});
  };

  const changeTemplate = (templateIndex: number) => {
    setSelectedTemplateIdx(templateIndex);
    setColoredPaths({});
  };

  const currentTemplate = COLORING_TEMPLATES[selectedTemplateIdx];
  const currentTemplateName = t(`data.templates.${currentTemplate.id}.name`);

  const downloadImage = () => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = 300;
    canvas.height = 250;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        const link = document.createElement("a");
        link.download = t("games.coloring.downloadFilename", { name: currentTemplateName });
        link.href = canvas.toDataURL();
        link.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const saveCurrentToGallery = () => {
    if (Object.keys(coloredPaths).length === 0) return;
    const entry: GalleryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      templateId: currentTemplate.id,
      paths: { ...coloredPaths },
      savedAt: Date.now(),
    };
    const next = [entry, ...gallery].slice(0, GALLERY_LIMIT);
    setGallery(next);
    saveGallery(next);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  };

  const deleteFromGallery = (id: string) => {
    const next = gallery.filter(entry => entry.id !== id);
    setGallery(next);
    saveGallery(next);
  };

  const loadFromGallery = (entry: GalleryEntry) => {
    const idx = COLORING_TEMPLATES.findIndex(template => template.id === entry.templateId);
    if (idx >= 0) {
      setSelectedTemplateIdx(idx);
      setColoredPaths(entry.paths);
    }
  };

  const howToSteps = t("games.coloring.howTo.steps", { returnObjects: true }) as Array<{
    label: string;
    text: string;
  }>;

  const renderTemplatePreview = (
    template: (typeof COLORING_TEMPLATES)[number],
    paths: { [key: number]: string },
    options?: { useReference?: boolean }
  ) => (
    <svg width="100%" height="100%" viewBox="0 0 300 250" aria-hidden="true">
      {template.paths.map((path, index) => {
        const fill = options?.useReference
          ? template.referenceColors[index] ?? "transparent"
          : paths[index] ?? "transparent";
        return (
          <path
            key={index}
            d={path}
            fill={fill}
            stroke="#333"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <Button
          onClick={() => setShowReference(prev => !prev)}
          className={`h-11 rounded-full px-4 text-sm ${
            showReference
              ? "bg-purple-500 text-white hover:bg-purple-600"
              : "border-2 border-purple-400 bg-white text-purple-600 hover:bg-purple-50"
          }`}
          aria-pressed={showReference}
        >
          {showReference ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>
            {showReference
              ? t("games.coloring.hideReference")
              : t("games.coloring.showReference")}
          </span>
        </Button>

        <Button
          onClick={() => setShowTutorial(true)}
          className="h-11 rounded-full bg-blue-500 px-4 text-sm text-white hover:bg-blue-600"
          aria-label={t("games.common.tutorialButton")}
        >
          <HelpCircle className="h-4 w-4" />
          <span>{t("games.common.tutorialButton")}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-4 border-pink-300 bg-linear-to-br from-pink-100 to-purple-100 p-6">
          <h3 className="mb-4 text-center text-2xl font-bold text-purple-800">
            <Palette className="mr-2 inline" aria-hidden="true" />
            {t("games.coloring.palette")}
          </h3>

          <div className="mb-4 grid grid-cols-2 gap-3">
            {COLOR_PALETTE_IDS.map(id => {
              const def = COLOR_DEFS[id];
              const colorName = t(`data.colors.${id}.name`);
              return (
                <Button
                  key={id}
                  onClick={() => handleColorSelect(id, def.hex)}
                  className={`h-16 rounded-xl border-4 transition-all duration-300 motion-reduce:transition-none ${
                    selectedHex === def.hex && !isErasing
                      ? "scale-110 border-purple-500 shadow-lg"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: def.hex }}
                  aria-label={colorName}
                  aria-pressed={selectedHex === def.hex && !isErasing}
                >
                  <span className="text-sm font-bold text-white drop-shadow-lg">{colorName}</span>
                </Button>
              );
            })}
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setIsErasing(!isErasing)}
              className={`h-12 w-full ${
                isErasing
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              aria-pressed={isErasing}
            >
              <Eraser className="mr-2" />
              {isErasing ? t("games.coloring.tools.eraseOn") : t("games.coloring.tools.eraseOff")}
            </Button>

            <Button
              onClick={clearAll}
              className="h-12 w-full bg-orange-500 text-white hover:bg-orange-600"
            >
              <RotateCcw className="mr-2" />
              {t("games.coloring.tools.clearAll")}
            </Button>

            <Button
              onClick={saveCurrentToGallery}
              disabled={Object.keys(coloredPaths).length === 0}
              className="h-12 w-full bg-purple-500 text-white hover:bg-purple-600 disabled:opacity-50"
            >
              <Save className="mr-2" />
              {savedFlash
                ? t("games.coloring.savedToGallery")
                : t("games.coloring.saveToGallery")}
            </Button>

            <Button
              onClick={downloadImage}
              className="h-12 w-full bg-green-500 text-white hover:bg-green-600"
            >
              <Download className="mr-2" />
              {t("games.coloring.tools.download")}
            </Button>
          </div>
        </Card>

        <Card className="border-4 border-blue-300 bg-white p-6">
          <h3 className="mb-4 text-center text-2xl font-bold text-blue-800">
            <span aria-hidden="true">{currentTemplate.emoji}</span> {currentTemplateName}
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-3">
              <svg
                ref={svgRef}
                width="100%"
                height="200"
                viewBox="0 0 300 250"
                className="rounded-lg border-2 border-dashed border-gray-300 bg-white"
                aria-label={currentTemplateName}
              >
                {currentTemplate.paths.map((path, index) => (
                  <path
                    key={index}
                    d={path}
                    fill={coloredPaths[index] || "transparent"}
                    stroke="#333"
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:stroke-purple-500 motion-reduce:transition-none"
                    onClick={() => handlePathClick(index)}
                  />
                ))}
              </svg>
            </div>

            {showReference && (
              <div className="rounded-xl border-2 border-purple-200 bg-purple-50 p-3">
                <div className="mb-1 text-xs font-semibold text-purple-700">
                  {t("games.coloring.showReference")}
                </div>
                <div className="h-44">
                  {renderTemplatePreview(currentTemplate, {}, { useReference: true })}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-center text-sm text-gray-600">
            <div className="mb-1 font-semibold">
              {isErasing
                ? t("games.coloring.canvas.hintErasing")
                : t("games.coloring.canvas.hintColoring")}
            </div>
            <div>{t("games.coloring.canvas.pickFromPalette")}</div>
          </div>
        </Card>

        <Card className="border-4 border-green-300 bg-linear-to-br from-green-100 to-blue-100 p-6">
          <h3 className="mb-4 text-center text-2xl font-bold text-green-800">
            {t("games.coloring.templates")}
          </h3>

          <div className="space-y-3">
            {COLORING_TEMPLATES.map((template, index) => (
              <Button
                key={template.id}
                onClick={() => changeTemplate(index)}
                className={`h-16 w-full text-left ${
                  selectedTemplateIdx === index
                    ? "border-4 border-green-700 bg-green-500 text-white hover:bg-green-600"
                    : "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-pressed={selectedTemplateIdx === index}
              >
                <div className="flex items-center">
                  <span className="mr-3 text-3xl" aria-hidden="true">
                    {template.emoji}
                  </span>
                  <span className="text-lg font-semibold">
                    {t(`data.templates.${template.id}.name`)}
                  </span>
                </div>
              </Button>
            ))}
          </div>

          <div className="mt-6 rounded-lg border-2 border-green-200 bg-white p-4">
            <h4 className="mb-2 font-bold text-green-700">{t("games.coloring.progressTitle")}</h4>
            <div className="text-sm text-gray-600">
              <div>
                {t("games.coloring.progressStatus", {
                  filled: Object.keys(coloredPaths).length,
                  total: currentTemplate.paths.length,
                })}
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-500 transition-all duration-300 motion-reduce:transition-none"
                  style={{
                    width: `${
                      (Object.keys(coloredPaths).length / currentTemplate.paths.length) * 100
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-6 border-4 border-purple-300 bg-white p-4">
        <h4 className="mb-3 text-center text-xl font-bold text-purple-800">
          {t("games.coloring.gallery")}
        </h4>

        {gallery.length === 0 ? (
          <p className="text-center text-sm text-purple-500">
            {t("games.coloring.galleryEmpty")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {gallery.map(entry => {
              const tpl = COLORING_TEMPLATES.find(template => template.id === entry.templateId);
              if (!tpl) return null;
              return (
                <div
                  key={entry.id}
                  className="overflow-hidden rounded-lg border-2 border-purple-200 bg-white"
                >
                  <button
                    type="button"
                    onClick={() => loadFromGallery(entry)}
                    className="block aspect-square w-full p-2 transition-all hover:bg-purple-50 motion-reduce:transition-none"
                    aria-label={t(`data.templates.${entry.templateId}.name`)}
                  >
                    {renderTemplatePreview(tpl, entry.paths)}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFromGallery(entry.id)}
                    className="flex w-full items-center justify-center gap-1 border-t border-purple-200 bg-purple-50 px-1 py-1 text-xs text-purple-700 hover:bg-purple-100"
                    aria-label={t("games.coloring.deleteFromGallery")}
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t("games.coloring.deleteFromGallery")}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-6 border-4 border-yellow-300 bg-linear-to-r from-yellow-100 to-orange-100 p-4">
        <div className="text-center">
          <h4 className="mb-2 text-xl font-bold text-orange-800">
            {t("games.coloring.howTo.title")}
          </h4>
          <div className="grid grid-cols-1 gap-4 text-sm text-orange-700 md:grid-cols-3">
            {howToSteps.map((step, index) => (
              <div key={index}>
                <span className="font-semibold">{step.label}</span> {step.text}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {showTutorial && (
        <GameTutorial
          onClose={() => setShowTutorial(false)}
          stepsKey="tutorial.coloring.steps"
          examples={COLORING_EXAMPLES}
        />
      )}
    </div>
  );
}
