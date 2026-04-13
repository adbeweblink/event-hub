"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useEventWizard } from "../../hooks/use-event-wizard";
import { StepIndicator } from "./step-indicator";
import { Step1Basic } from "./step1-basic";
import { Step2Venue } from "./step2-venue";
import { Step3Date } from "./step3-date";
import { Step4Audience } from "./step4-audience";
import { Step5Rundown } from "./step5-rundown";
import { Step6Marketing } from "./step6-marketing";
import { Step7Summary } from "./step7-summary";

export function EventWizard() {
  const {
    step, totalSteps,
    draft, update, updateMany,
    next, prev, goTo,
    addRundownItem, removeRundownItem, updateRundownItem,
    rundownWithTimes,
    totalBudget,
  } = useEventWizard();

  function handleCreate() {
    // TODO: 存入 state / Supabase
    alert(`活動「${draft.name || `${draft.year} ${draft.quarter} 活動`}」已建立！`);
    // TODO: redirect to event detail page
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">新增活動</h1>
        <p className="text-sm text-muted-foreground">精靈引導，一步一步來</p>
      </div>

      <StepIndicator current={step} total={totalSteps} />

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
