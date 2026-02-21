"use client";

import { SummaryStrip } from "@/components/layout/summary-strip";
import { RecoveryChart } from "@/components/charts/recovery-chart";
import { HrvChart } from "@/components/charts/hrv-chart";
import { RestingHrChart } from "@/components/charts/resting-hr-chart";
import { SleepPerformanceChart } from "@/components/charts/sleep-performance-chart";
import { SleepStagesChart } from "@/components/charts/sleep-stages-chart";
import { SleepDurationChart } from "@/components/charts/sleep-duration-chart";
import { StrainChart } from "@/components/charts/strain-chart";
import { Spo2Chart } from "@/components/charts/spo2-chart";
import { SkinTempChart } from "@/components/charts/skin-temp-chart";
import { RespiratoryChart } from "@/components/charts/respiratory-chart";
import { CaloriesChart } from "@/components/charts/calories-chart";
import { WeightChart } from "@/components/charts/weight-chart";
import { BodyCompChart } from "@/components/charts/body-comp-chart";
import { BmiCard } from "@/components/charts/bmi-card";
import { WorkoutChart } from "@/components/charts/workout-chart";
import { WorkoutHrChart } from "@/components/charts/workout-hr-chart";

function SectionHeader({ label, id }: { label: string; id: string }) {
  return (
    <h2 id={id} className="section-header">
      <span>{label}</span>
    </h2>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="sr-only">Health Dashboard</h1>

      <section aria-label="Summary metrics">
        <SummaryStrip />
      </section>

      <section aria-labelledby="section-recovery">
        <SectionHeader label="Recovery & Vitals" id="section-recovery" />
        <div className="mt-3 grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <RecoveryChart />
          <HrvChart />
          <RestingHrChart />
        </div>
      </section>

      <section aria-labelledby="section-sleep">
        <SectionHeader label="Sleep" id="section-sleep" />
        <div className="mt-3 grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <SleepPerformanceChart />
          <SleepStagesChart />
          <SleepDurationChart />
        </div>
      </section>

      <section aria-labelledby="section-activity">
        <SectionHeader label="Activity & Strain" id="section-activity" />
        <div className="mt-3 grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <StrainChart />
          <CaloriesChart />
          <Spo2Chart />
        </div>
      </section>

      <section aria-labelledby="section-workouts">
        <SectionHeader label="Workouts" id="section-workouts" />
        <div className="mt-3 grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2">
            <WorkoutChart />
          </div>
          <WorkoutHrChart />
        </div>
      </section>

      <section aria-labelledby="section-body">
        <SectionHeader label="Body & Metabolism" id="section-body" />
        <div className="mt-3 grid gap-3 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          <WeightChart />
          <SkinTempChart />
          <RespiratoryChart />
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <BodyCompChart />
          </div>
          <BmiCard />
        </div>
      </section>
    </div>
  );
}
