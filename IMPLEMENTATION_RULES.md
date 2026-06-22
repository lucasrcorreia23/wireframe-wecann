# Regras de implementação

## Confiança mínima de 95% antes de codar

**Toda implementação exige pelo menos 95% de confiança antes de escrever código.**

- Antes de implementar qualquer mudança, o agente precisa entender com clareza **o requisito**
  (o "o quê") e **a abordagem** (o "como"), incluindo onde a mudança encaixa no produto.
- Se houver **qualquer dúvida relevante** — requisito ambíguo, mais de uma abordagem possível,
  impacto incerto em outras telas/comportamentos, ou falta de referência visual — **PERGUNTE ao
  usuário** (use perguntas objetivas, com opções quando fizer sentido) e **continue perguntando
  até atingir os 95%**.
- **Nunca assuma** em cima de incerteza relevante. É melhor uma pergunta a mais do que refazer
  trabalho ou quebrar o produto.
- Exceções: correções triviais e óbvias (ex.: erro de digitação, ajuste de um valor já acordado)
  não exigem nova rodada de perguntas.

## Por que

O produto é um wireframe de alta fidelidade com decisões visuais e de arquitetura sensíveis
(mundo 3D + overlay, vidro/blur, navegação). Mudanças feitas com baixa confiança custam caro
(retrabalho, regressões). Clareza antes de código mantém a qualidade e a velocidade.
