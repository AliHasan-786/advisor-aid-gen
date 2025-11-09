"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import type { TrainingModule } from "@/lib/types";

interface MicroLessonModalProps {
  open: boolean;
  onClose: () => void;
  module: TrainingModule | null;
  onComplete: () => void;
}

export function MicroLessonModal({ open, onClose, module, onComplete }: MicroLessonModalProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  if (!module) return null;

  const handleComplete = () => {
    onComplete();
    onClose();
    setSelectedChoice(null);
  };

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl">
                <Dialog.Title className="text-lg font-semibold text-navy-700">{module.title}</Dialog.Title>
                <p className="text-sm text-slate-500">Duration: {module.durationMin} minutes</p>
                <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                  {module.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-700">Scenario Check</p>
                  <p className="text-sm text-slate-600">{module.scenarioQuestion}</p>
                  <div className="space-y-2">
                    {module.scenarioChoices.map((choice, idx) => (
                      <label key={choice} className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-600">
                        <input
                          type="radio"
                          name="micro-lesson"
                          checked={selectedChoice === idx}
                          onChange={() => setSelectedChoice(idx)}
                          className="mt-1 h-3.5 w-3.5 text-navy-600 focus:ring-navy-500"
                        />
                        {choice}
                      </label>
                    ))}
                  </div>
                  {selectedChoice !== null && selectedChoice === module.answerIndex && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      Correct — log completion to reinforce this behavior in future briefs.
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    disabled={selectedChoice === null}
                    onClick={handleComplete}
                    className="rounded-lg bg-navy-600 px-4 py-2 text-sm font-semibold text-white transition enabled:hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Mark Complete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
