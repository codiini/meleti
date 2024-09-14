<script lang="ts" setup>
import { Line } from "vue-chartjs";
import ChartLegend from "./ChartLegend.vue";

const props = defineProps<{
  testResults: any; // TODO: Define a type for test results
}>();

const chartData = reactive({
  labels: [],
  datasets: [],
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  elements: {
    point: {
      radius: 7,
      borderWidth: 2,
    },
    line: {
      tension: 5,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        font: {
          family: "Inter",
          size: 13,
        },
        display: true,
        text: "Score (%)",
      },
    },
    x: {
      title: {
        font: {
          family: "Inter",
          size: 13,
        },
        display: true,
        text: "Test Date",
      },
    },
  },
  layout: {
    padding: {
      left: 10,
      right: 10,
      top: 10,
      bottom: 10,
    },
  },
  plugins: {
    htmlLegend: {
      containerID: "legend-container",
    },
    legend: {
      display: false,
    },

    title: {
      font: {
        size: 13,
        family: "Inter",
      },
      display: true,
      text: "Performance Over Time",
    },
  },
});

onBeforeMount(async () => {
  const courseData = {};

  props.testResults.forEach((result) => {
    const date = new Date(result.completed_at);
    const courseId = result.tests.course_id.id;
    const courseTitle = result.tests.course_id.title;

    if (!courseData[courseId]) {
      courseData[courseId] = {
        label: courseTitle,
        data: [],
        borderColor: result.tests.course_id.color_code,
        fill: false,
        tension: 0.1,
      };
    }

    courseData[courseId].data.push({
      x: formatDate(date),
      y: result.score,
    });
  });

  chartData.datasets = Object.values(courseData);
  chartData.labels = [
    ...new Set(
      chartData.datasets.flatMap((dataset) =>
        dataset.data.map((point) => point.x)
      )
    ),
  ].sort((a, b) => new Date(a) - new Date(b));
});
</script>
<template>
  <div class="absolute -top-6 left-0">
    <ChartLegend :legendValues="chartData.datasets" />
  </div>
  <Line :data="chartData" :options="chartOptions" />
</template>
