import { useEffect, useState } from "react";
import api, { fetchFilteredPlans, PlanSearchParams, fetchRecommendations, RecommendationParams } from "../services/api";
import PlanCard from "../components/PlanCard";
import Menu from "../components/Menu";
import Footer from "../components/Footer";
import styles from "../styles/Home.module.scss";
import ReactModal from "../components/Modal";
import { X } from 'lucide-react'

interface Plan {
  id: number;
  name: string;
  speed: string;
  price: number;
  operator: string;
  city: string;
  dataCap: number;
  benefits?: string[];
}

interface PaginatedPlans {
  plans: Plan[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const OPERATORS = ["Vivo", "Claro", "TIM", "Oi"];
const CITIES = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Curitiba",
  "Recife",
  "Porto Alegre",
  "Salvador",
  "Fortaleza",
  "Brasília",
];

const USAGE_PROFILE = [
  { label: "Redes sociais / Navegação / WhatsApp", value: "1" },
  { label: "Aulas online / Reuniões (Zoom, Meet)", value: "2" },
  { label: "Streaming HD (Netflix, YouTube)", value: "3" },
  { label: "Streaming 4K / TV ao vivo", value: "4" },
  { label: "Jogos online", value: "5" },
  { label: "Download pesado / Upload de vídeos", value: "6" },
  { label: "Trabalho remoto", value: "7" },
  { label: "Casa com muitos dispositivos conectados", value: "8" },
];

export default function Home() {
  const [filters, setFilters] = useState<PlanSearchParams>({
    page: 1,
    pageSize: 5,
  });
  const [result, setResult] = useState<PaginatedPlans | null>(null);
  const [loading, setLoading] = useState(false);
  const [planNames, setPlanNames] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [recomFields, setRecomFields] = useState<RecommendationParams>({ recomCity: "", recomUsageProfile: "" });
  const [recommendedPlans, setRecommendedPlans] = useState<Plan>({  } as Plan);


  const handleModal = () => {
    setIsOpen((prev) => !prev);
  }

  useEffect(() => {
    setLoading(true);
    fetchFilteredPlans(filters)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    // Buscar nomes dos planos ao montar
    api
      .get("/plans/search", { params: { page: 1, pageSize: 1000 } })
      .then((res) => {
        const names = res.data.plans.map((p: any) => p.name);
        setPlanNames(Array.from(new Set(names)));
      });
  }, []);

  // Requisição de recomendação de planos baseada nos campos selecionados
  useEffect(() => {
  async function getRecommendation() {
    if (recomFields.recomCity && recomFields.recomUsageProfile) {
      const plan = await fetchRecommendations(recomFields);
      setRecommendedPlans(plan);
    }
  }

  getRecommendation();
}, [recomFields]);


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value ? value : undefined,
      page: 1,
    }));
  }

  // foi necessário criar uma função separada para lidar com as mudanças nos campos de recomendação, garantindo que o estado seja atualizado corretamente com base na entrada do usuário.
  async function handleRecommendationPlan(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) {
  const { name, value } = e.target;

  setRecomFields((prev) => ({
    ...prev,
    [name]: value || "",
  }));
}


  function handlePageChange(newPage: number) {
    setFilters((prev) => ({ ...prev, page: newPage }));
  }


  return (
    <>
      {/* Modal de recomendação de planos */}
      <ReactModal isOpen={isOpen} onClose={handleModal}>
        <button style={{ position: "absolute", top: 10, right: 10, cursor: "pointer", backgroundColor: "transparent", border: "none" }} onClick={() => setIsOpen(false)}><X /></button>
        <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
          Cidade
        </label>
        <select
          name="recomCity"
          onChange={handleRecommendationPlan}
          defaultValue=""
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1.5px solid #b2dfdb",
            background: "#fff",
            fontSize: 15,
          }}
        >
          <option value="">Selecione</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
          Selecione a opção que mais tem a ver com você
        </label>
        <select
          name="recomUsageProfile"
          onChange={handleRecommendationPlan}
          defaultValue=""
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1.5px solid #b2dfdb",
            background: "#fff",
            fontSize: 15,
          }}
        >
          <option value="">Selecione</option>
          {USAGE_PROFILE.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
          { /* Exibe o plano recomendado se disponível, utilizando o mesmo componente já existente. */ }
        { recommendedPlans.id && <PlanCard key={recommendedPlans.id} plan={recommendedPlans} />}

      </ReactModal>
      <Menu />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {/* Sidebar de Filtros */}
        <aside
          style={{
            width: 300,
            minHeight: 500,
            background: "#f7fafc",
            borderRadius: 16,
            boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
            padding: 32,
            marginRight: 32,
            display: "flex",
            flexDirection: "column",
            gap: 32,
          }}
        >
          <h2
            style={{
              color: "#00897b",
              fontWeight: 700,
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Filtrar planos
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Nome do plano
            </label>
            <select
              name="name"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {planNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Operadora
            </label>
            <select
              name="operator"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {OPERATORS.map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Cidade
            </label>
            <select
              name="city"
              onChange={handleChange}
              defaultValue=""
              style={{
                padding: 10,
                borderRadius: 8,
                border: "1.5px solid #b2dfdb",
                background: "#fff",
                fontSize: 15,
              }}
            >
              <option value="">Selecione</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Preço
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                name="minPrice"
                placeholder="Mín."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #009688",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <input
                type="number"
                name="maxPrice"
                placeholder="Máx."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #b2dfdb",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <button
                type="button"
                style={{
                  background: "#009688",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
                title="Buscar por preço"
                tabIndex={-1}
                disabled
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" stroke="#fff" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#fff" />
                </svg>
              </button>
            </div>
            <label style={{ color: "#00897b", fontWeight: 600, fontSize: 15 }}>
              Franquia (GB)
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="number"
                name="minDataCap"
                placeholder="Mín."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #009688",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <input
                type="number"
                name="maxDataCap"
                placeholder="Máx."
                onChange={handleChange}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  border: "2px solid #b2dfdb",
                  background: "#fff",
                  fontSize: 16,
                  width: 110,
                  outline: "none",
                  transition: "border 0.2s",
                }}
              />
              <button
                type="button"
                style={{
                  background: "#009688",
                  border: "none",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  marginLeft: 4,
                }}
                title="Buscar por franquia"
                tabIndex={-1}
                disabled
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" stroke="#fff" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="#fff" />
                </svg>
              </button>
            </div>
          </div>
        </aside>
        {/* Conteúdo principal */}
        <div className={styles.container} style={{ flex: 1 }}>
          <h1 className={styles.titulo}>Buscar ofertas de planos</h1>
          <p className={styles.subtitulo}>
            Filtre por preço, franquia, operadora, cidade, nome e navegue pelos
            resultados!
          </p>
          {/* Resultados */}
          {loading ? (
            <div style={{ textAlign: "center", margin: 32 }}>Carregando...</div>
          ) : result && result.plans.length > 0 ? (
            <>
              <section className={styles.planos}>
                {result.plans.map((plan) => (
                  <PlanCard key={plan.id} plan={plan} />
                ))}
              </section>
              {/* Paginação */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: 24,
                }}
              >
                <button
                  onClick={() => handlePageChange(result.page - 1)}
                  disabled={result.page === 1}
                  style={{
                    marginRight: 12,
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background: result.page === 1 ? "#eee" : "#fff",
                    cursor: result.page === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  Anterior
                </button>
                <span style={{ alignSelf: "center", fontWeight: 500 }}>
                  Página {result.page} de {result.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(result.page + 1)}
                  disabled={result.page === result.totalPages}
                  style={{
                    marginLeft: 12,
                    padding: "8px 18px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    background:
                      result.page === result.totalPages ? "#eee" : "#fff",
                    cursor:
                      result.page === result.totalPages
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Próxima
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", margin: 32 }}>
              Nenhum plano encontrado.
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
