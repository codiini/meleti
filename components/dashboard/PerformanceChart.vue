<script lang="ts" setup>
import { Line } from "vue-chartjs";

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
  legend: {
    labels: {
      usePointStyle: true,
      pointStyle: "circle",
      pointRadius: 8,
      pointBorderWidth: 2,
      font: {
        size: 16,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Score (%)",
      },
    },
    x: {
      title: {
        display: true,
        text: "Test Date",
      },
    },
  },
  plugins: {
    title: {
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
  <Line :data="chartData" :options="chartOptions" />
</template>
