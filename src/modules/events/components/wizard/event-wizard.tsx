"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { useEventWizard } from "../../hooks/use-event-wizard";
import { RUNDOWN_ITEM_TYPES } from "../../constants";
import { StepIndicator } from "./step-indicator";
import { Step1Basic } from "./step1-basic";
import { Step2Venue } from "./step2-venue";
import { Step3Date } from "./step3-date";
import { Step4Audience } from "./step4-audience";
import { Step5Rundown } from "./step5-rundown";
import { Step6Marketing } from "./step6-marketing";
import { Step7Summary } from "./step7-summary";

// Completion tracking
interface FieldCheck {
  label: string;
  done: boolean;
  step: number;
}

function useCompletion(draft: ReturnType<typeof useEventWizard>["draft"], rundownLen: number): {
  percent: number;
  fields: FieldCheck[];
  missing: FieldCheck[];
} {
  return useMemo(() => {
    const fields: FieldCheck[] = [
      { label: "活動類型", done: !!draft.type, step: 1 },
      { label: "活動形式", done: !!draft.format, step: 1 },
      { label: "暫定名稱", done: !!draft.name, step: 1 },
      { label: "預計人數", done: draft.expectedAttendees > 0, step: 2 },
      { label: "候選場地", done: draft.venueIds.length > 0, step: 2 },
      { label: "暫押日期", done: draft.tentativeDates.length > 0, step: 3 },
      { label: "受眾描述", done: !!draft.audienceDescription, step: 4 },
      { label: "活動描述", done: !!draft.description, step: 4 },
      { label: "議程 Rundown", done: rundownLen > 0, step: 5 },
      { label: "行銷管道", done: draft.marketingChannels.length > 0, step: 6 },
      { label: "報名方式", done: !!draft.registrationMethod, step: 6 },
    ];
    const doneCount = fields.filter((f) => f.done).length;
    const percent = Math.round((doneCount / fields.length) * 100);
    const missing = fields.filter((f) => !f.done);
    return { percent, fields, missing };
  }, [draft, rundownLen]);
}

export function EventWizard() {
  const {
    step, totalSteps,
    draft, update, updateMany,
    next, prev, goTo,
    addRundownItem, removeRundownItem, updateRundownItem,
    rundownWithTimes,
    totalBudget,
  } = useEventWizard();

  const { percent, missing } = useCompletion(draft, rundownWithTimes.length);

  function handleCreate() {
    alert(`活動「${draft.name || `${draft.year} ${draft.quarter} 活動`}」已建立！`);
  }

  return (
    <div className="space-y-4">
      {/* Header + completion */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">新增活動</h1>
          <p className="text-sm text-muted-foreground">精靈引導，一步一步來</p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{percent}%</span>
            <Progress value={percent} className="w-32 h-2" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {missing.length > 0 ? `${missing.length} 項未填` : "全部完成"}
          </p>
        </div>
      </div>

      <StepIndicator current={step} total={totalSteps} />

      {/* Content — full width */}
      <Card className="ring-1 ring-foreground/10">
        <CardContent className="p-6">
          {step === 1 && <Step1Basic draft={draft} update={update} />}
          {step === 2 && <Step2Venue draft={draft} update={update} />}
          {step === 3 && <Step3Date draft={draft} update={update} />}
          {step === 4 && <Step4Audience draft={draft} update={update} />}
          {step === 5 && (
            <Step5Rundown
              draft={draft}
              update={update}
              addRundownItem={addRundownItem}
              removeRundownItem={removeRundownItem}
              updateRundownItem={updateRundownItem}
              rundownWithTimes={rundownWithTimes}
              totalBudget={totalBudget}
            />
          )}
          {step === 6 && <Step6Marketing draft={draft} update={update} />}
          {step === 7 && <Step7Summary draft={draft} rundownWithTimes={rundownWithTimes} />}
        </CardContent>
      </Card>

      {/* Missing fields hint (collapsed) */}
      {missing.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
          <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {missing.map((f) => (
              <button
                key={f.label}
                type="button"
                onClick={() => goTo(f.step)}
                className="text-muted-foreground hover:text-primary hover:underline"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prev}
          disabled={step === 1}
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          上一步
        </Button>

        <span className="text-sm text-muted-foreground">
          {step} / {totalSteps}
        </span>

        {step < totalSteps ? (
          <Button onClick={next}>
            下一步
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleCreate}>
            <Check className="mr-1.5 h-4 w-4" />
            建立活動
          </Button>
        )}
      </div>
    </div>
  );
}
