export const PRODUTOS = [
  { value: "ferro", label: "Ferro", meta: 250 },
  { value: "plastico", label: "Plástico", meta: 250 },
  { value: "niquel", label: "Níquel", meta: 250 },
  { value: "carca_bateria", label: "Carça de Bateria", meta: 250 },
  { value: "tecido", label: "Tecido", meta: 250 },
];

export function getProduto(value: string) {
  return PRODUTOS.find((p) => p.value === value);
}
