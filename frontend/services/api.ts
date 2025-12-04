import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

export default api;

export interface PlanSearchParams {
  minPrice?: number;
  maxPrice?: number;
  minDataCap?: number;
  maxDataCap?: number;
  operator?: string;
  city?: string;
  name?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchFilteredPlans(params: PlanSearchParams) {
  const { data } = await api.get("/plans/search", { params });
  return data;
}

export interface RecommendationParams {
  recomCity: string;
  recomUsageProfile: string;
} 

export async function fetchRecommendations(params: RecommendationParams) {
  const { data } = await api.get("/plans/recommendation", { params });
  return data;
}
