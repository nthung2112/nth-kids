import { useState } from "react";

import { Settings, Volume2, VolumeX } from "lucide-react";
import { useTranslation } from "react-i18next";

import SettingsCenter from "@/components/settings/settings-center";
import { Button } from "@/components/ui/button";
import { usePreferences } from "@/hooks/usePreferences";
import { useSound } from "@/hooks/useSound";

export default function SettingsTrigger() {
  const { t } = useTranslation();
  const { prefs, update } = usePreferences();
  const { playClickSound } = useSound();
  const [open, setOpen] = useState(false);

  const soundLabel = prefs.soundMuted ? t("common.soundOn") : t("common.soundOff");
  const settingsLabel = t("settings.trigger");

  return (
    <>
      <div className="fixed top-3 right-3 z-40 flex flex-col gap-2 sm:top-4 sm:right-4">
        <Button
          onClick={() => {
            update({ soundMuted: !prefs.soundMuted });
          }}
          className={`h-11 w-11 rounded-full p-0 sm:h-12 sm:w-12 ${
            prefs.soundMuted
              ? "bg-gray-500 hover:bg-gray-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white shadow-lg`}
          title={soundLabel}
          aria-label={soundLabel}
          aria-pressed={!prefs.soundMuted}
        >
          {prefs.soundMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>

        <Button
          onClick={() => {
            playClickSound();
            setOpen(true);
          }}
          className="h-11 w-11 rounded-full bg-purple-600 p-0 text-white shadow-lg hover:bg-purple-700 sm:h-12 sm:w-12"
          title={settingsLabel}
          aria-label={settingsLabel}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {open && <SettingsCenter onClose={() => setOpen(false)} />}
    </>
  );
}
