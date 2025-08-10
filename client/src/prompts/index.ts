import { parseJSON } from "@/lib/utils";

export interface PromptTemplate {
  id: number;
  name: string;
  description: string;
  content: string;
  popularity?: number;
  variables?: {
    name: string;
    label: string;
    description: string;
    value?: string;
  }[];
}

export const getPromptTemplate = (id: number): PromptTemplate | undefined => {
  const popularity = parseJSON(
    localStorage.getItem(`promptsPopularity`) || "{}"
  );
  if (!popularity[id]) {
    popularity[id] = 0;
  }
  popularity[id] += 1;
  localStorage.setItem(`promptsPopularity`, JSON.stringify(popularity));
  return prompts.find((prompt) => prompt.id === id);
};

export const getPopularPrompts = (): PromptTemplate[] => {
  const popularity = parseJSON(
    localStorage.getItem(`promptsPopularity`) || "{}"
  );
  const sortedPrompts = prompts
    .map((prompt) => ({
      ...prompt,
      popularity: popularity[prompt.id] || 0,
    }))
    .sort((a, b) => b.popularity - a.popularity);
  return sortedPrompts;
};

const prompts: PromptTemplate[] = [
  {
    id: 1,
    name: "Calculate expression",
    description: "Calculate math or date expression ",
    content: "Calculate expression '[expression]'",
    variables: [
      {
        name: "expression",
        label: "Expression",
        description: "Math or date expression to calculate.",
      },
    ],
  },
  {
    id: 2,
    name: "Bar Chart example",
    description: "Examples of charts and visualizations",
    content:
      'Show bar chart for next data: ["Mon", 10], ["Tue", 20], ["Wed", 30] where value is "Requests"',
  },
  {
    id: 3,
    name: "Line Chart example",
    description: "Examples of charts and visualizations",
    content:
      'Show line chart for next series of data: One: ["7/10", 10], ["7/11", 20], ["7/12", 5] and Two: ["7/10", 40], ["7/11", 50], ["7/12", 90]',
  },
  {
    id: 4,
    name: "Random Bar Chart",
    description: "Examples of charts and visualizations",
    content:
      "Get [count] random numbers from 10 to 100 not using any tools. Use those numbers to show a bar chart. Labels are: A, B, C, etc.",
    variables: [
      {
        name: "count",
        label: "Count",
        description: "Number of random values to generate.",
        value: "10",
      },
    ],
  },
  {
    id: 5,
    name: "3d Visualization",
    description: "Examples of 3D visualizations",
    content:
      "Create 3d scene: Flying through star field, stars coming from center. In the middle there is cube rotating, with basic lighting.",
  },
];

export default prompts;
