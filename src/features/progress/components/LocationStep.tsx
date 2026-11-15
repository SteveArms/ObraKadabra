"use client";

import { cn } from "@/lib/cn";
import type { Room } from "@/schemas/floor-plan";
import { useProgressStore } from "../store";
import type { LevelChoice } from "../types";
import { StepCard } from "./StepCard";

const CHIP = "flex min-h-10 items-center justify-center rounded-md px-space-sm text-body-md transition-[background-color,color] duration-150";

export function LocationStep({ choices, rooms }: { choices: LevelChoice[]; rooms: Room[] }) {
  const choiceId = useProgressStore((state) => state.choiceId);
  const roomId = useProgressStore((state) => state.roomId);
  const setChoice = useProgressStore((state) => state.setChoice);
  const setRoom = useProgressStore((state) => state.setRoom);
  const choice = choices.find((item) => item.id === choiceId) ?? choices[0];
  const levelRooms = choice.id === "roof" ? [] : rooms.filter((room) => room.level === choice.level);
  const pill = (active: boolean) => cn(CHIP, active ? "bg-primary-container font-semibold text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest");
  return (
    <StepCard step={1} title="Location" icon="location_on">
      <fieldset className="flex flex-col gap-space-xs">
        <legend className="mb-space-xs text-body-sm text-on-surface-variant">Level</legend>
        <div className="grid grid-cols-3 gap-space-xs">
          {choices.map((item) => (
            <button key={item.id} type="button" aria-pressed={item.id === choice.id} onClick={() => setChoice(item.id)} className={pill(item.id === choice.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>
      {levelRooms.length > 0 ? (
        <fieldset className="flex flex-col gap-space-xs">
          <legend className="mb-space-xs text-body-sm text-on-surface-variant">Sector or room</legend>
          <div className="flex flex-wrap gap-space-xs">
            <button type="button" aria-pressed={!roomId} onClick={() => setRoom(undefined)} className={cn(pill(!roomId), "min-h-9 text-body-sm")}>
              Whole floor
            </button>
            {levelRooms.map((room) => (
              <button key={room.id} type="button" aria-pressed={room.id === roomId} onClick={() => setRoom(room.id)} className={cn(pill(room.id === roomId), "min-h-9 text-body-sm")}>
                {room.name}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
    </StepCard>
  );
}
