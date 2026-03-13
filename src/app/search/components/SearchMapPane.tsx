import type { RefObject } from "react";
import { ExternalLink, Maximize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchMapPaneProps = {
  mapExpanded: boolean;
  onToggleMapExpanded: () => void;
  mapContainerRef: RefObject<HTMLDivElement | null>;
  mapLoadError: string | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onOpenExternalMap: () => void;
};

export function SearchMapPane({
  mapExpanded,
  onToggleMapExpanded,
  mapContainerRef,
  mapLoadError,
  onZoomIn,
  onZoomOut,
  onOpenExternalMap,
}: SearchMapPaneProps) {
  return (
    <aside className="search-pane-map hidden xl:block">
      <div className="sticky top-[96px]">
        <div
          className={cn(
            "search-map-frame relative overflow-hidden rounded-[20px] border border-[#D4D4D4] bg-white shadow-sm transition-all duration-300",
            mapExpanded ? "h-[calc(100dvh-130px)]" : "h-[638px]",
          )}
        >
          <div
            ref={mapContainerRef}
            className="search-map-canvas h-full w-full"
          />

          <div className="absolute right-6 top-6 z-20 space-y-[10px]">
            <button
              type="button"
              onClick={onToggleMapExpanded}
              className="search-map-control-btn grid h-[43px] w-[43px] place-items-center rounded-full bg-white text-[#3EA6FC] shadow-[1px_1px_5px_rgba(0,0,0,0.25)]"
              aria-label="Toggle map size"
            >
              <Maximize2 className="h-5 w-5" />
            </button>

            <div className="search-map-control-btn overflow-hidden rounded-[50px] bg-white shadow-[1px_1px_5px_rgba(0,0,0,0.25)]">
              <button
                type="button"
                onClick={onZoomIn}
                className="search-map-control-btn grid h-[45px] w-[43px] place-items-center text-[#3EA6FC]"
                aria-label="Zoom in"
              >
                <Plus className="h-5 w-5" />
              </button>
              <div className="h-px bg-[#E5E5E5]" />
              <button
                type="button"
                onClick={onZoomOut}
                className="search-map-control-btn grid h-[45px] w-[43px] place-items-center text-[#3EA6FC]"
                aria-label="Zoom out"
              >
                <Minus className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenExternalMap}
              className="search-map-control-btn inline-flex h-[43px] items-center gap-1 rounded-full bg-white px-3 text-xs font-medium text-[#3EA6FC] shadow-[1px_1px_5px_rgba(0,0,0,0.25)]"
            >
              Open
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>

          {mapLoadError ? (
            <div className="absolute inset-0 z-30 grid place-items-center bg-white/95 text-sm text-red-600">
              {mapLoadError}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
