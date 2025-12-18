import { Request, Response } from "express";
import {
  getPlans,
  filterPlans,
  searchPlans,
  PlanSearchFilters,
} from "../services/planService";
import { Plan } from "../models/plan";

export function allPlans(req: Request, res: Response) {
  const plans = getPlans()
    .map((plan: Plan) => {
      if (plan.price) {
        return { ...plan, name: plan.name.toUpperCase() };
      }
      return null;
    })
    .reduce((acc: Plan[], plan) => {
      if (plan && !plan.price) {
        acc.push(plan);
      }
      return acc;
    }, []);
  res.json(plans);
}

export function filteredPlans(req: Request, res: Response) {
  const minSpeed = req.query.minSpeed
    ? parseInt(req.query.minSpeed as string)
    : undefined;
  const maxPrice = req.query.maxPrice
    ? parseFloat(req.query.maxPrice as string)
    : undefined;
  const plans = getPlans();
  const filtered = filterPlans(plans, minSpeed, maxPrice);
  res.json(filtered);
}

export function planSearch(req: Request, res: Response) {
  const {
    minPrice,
    maxPrice,
    minDataCap,
    maxDataCap,
    operator,
    city,
    name,
    page = "1",
    pageSize = "5",
  } = req.query;

  const filters: PlanSearchFilters = {
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minDataCap: minDataCap ? Number(minDataCap) : undefined,
    maxDataCap: maxDataCap ? Number(maxDataCap) : undefined,
    operator: operator ? String(operator) : undefined,
    city: city ? String(city) : undefined,
    name: name ? String(name) : undefined,
  };

  const paginated = searchPlans(filters, Number(page), Number(pageSize));

  res.json(paginated);
}

// Função de recomendação de planos baseada na cidade e perfil de uso
export function recommendation(req: Request, res: Response) {
  const recomCity = String(req.query.recomCity || "");
  const recomUsageProfile = String(req.query.recomUsageProfile || "");

  // algumas validações no inicio da função ajudam a evitar processamento desnecessário. seguindo principios de fail fast.
  if (!recomCity || !recomUsageProfile) {
    return res.status(400).json([]);
  }


  // Função para normalizar strings (remover acentos e converter para minúsculas) é interessante porque facilita a comparação de strings, especialmente em casos onde os dados podem conter variações de acentuação ou capitalização.
  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const plans = getPlans();

  const cityPlans = plans.filter(
    (p) => normalize(p.city) === normalize(recomCity)
  );

  // Se não houver planos na cidade especificada, retorna um erro 404.
  if (cityPlans.length === 0) {
    return res.status(404).json([]);
  }

  // Mapeamento do perfil de uso para categorias internas de recomendação
  const usageMap: Record<string, string> = {
    "1": "basico",
    "2": "intermediario",
    "3": "intermediario",
    "4": "avancado",
    "5": "avancado",
    "6": "heavyUser",
    "7": "avancado",
    "8": "heavyUser",
  };

  const profileKey = usageMap[recomUsageProfile] || "intermediario";

  // Regras de pontuação para cada perfil de uso
  const rules: Record<string, { minSpeed: number; minDataCap: number }> = {
    basico: { minSpeed: 50, minDataCap: 100 },
    intermediario: { minSpeed: 150, minDataCap: 300 },
    avancado: { minSpeed: 300, minDataCap: 600 },
    heavyUser: { minSpeed: 600, minDataCap: 1000 },
  };

  const profile = rules[profileKey];

  // Função para converter velocidades de string para número em Mbps
  function parseSpeed(speed: string): number {
    const lower = speed.toLowerCase();

    if (lower.includes("gbps")) {
      return parseFloat(lower.replace("gbps", "")) * 1000;
    }

    if (lower.includes("mbps")) {
      return parseFloat(lower.replace("mbps", ""));
    }

    return 0;
  }

  // Calcula a pontuação de cada plano com base nas regras do perfil de uso
  const scored = cityPlans.map((plan) => {
    const speed = parseSpeed(plan.speed);
    let score = 0;

    if (speed >= profile.minSpeed) score += 50;
    if (plan.dataCap >= profile.minDataCap) score += 30;

    score += (1 / plan.price) * 10;

    return { ...plan, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return res.json(scored[0],
  );
}





