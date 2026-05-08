export const PRODUTOS = [
    { value: "produto_a", label: "Produto A", meta: 10 },
    { value: "produto_b", label: "Produto B", meta: 10 },
    { value: "produto_c", label: "Produto C", meta: 10 },
];
export function getProduto(value) {
    return PRODUTOS.find((p) => p.value === value);
}
