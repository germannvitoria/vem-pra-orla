# Como o índice de lazer é calculado

O índice vai de **0 a 5** e combina duas notas, também de 0 a 5:

```
índice = 0,6 × nota do clima + 0,4 × nota das ocorrências
```

O clima pesa mais (60%) porque é o fator que mais muda a experiência na orla. As ocorrências pesam 40%. **Esses pesos são uma escolha do projeto**, sem calibração com dados reais.

## Classificação

| Índice | Classificação |
|---|---|
| 4,0 ou mais | Ótimo |
| 3,0 a 3,9 | Bom |
| 2,0 a 2,9 | Regular |
| abaixo de 2,0 | Ruim |

## Nota do clima

Começa em 5 e perde pontos conforme as condições atuais (Open-Meteo):

| Fator | Condição | Penalidade |
|---|---|---|
| Chuva agora | 0,5 mm ou mais | −3 |
| Probabilidade de chuva | 70% ou mais | −2,5 |
| | 40% a 69% | −1,2 |
| | 20% a 39% | −0,4 |
| Sensação térmica | abaixo de 10 °C ou acima de 36 °C | −2 |
| | abaixo de 15 °C ou acima de 33 °C | −1 |
| | abaixo de 18 °C ou acima de 30 °C | −0,4 |
| Vento | acima de 40 km/h | −1,5 |
| | acima de 25 km/h | −0,7 |
| Tempestade (código WMO 95 ou mais) | | a nota do clima fica limitada a 0,5 |

## Nota das ocorrências

Começa em 5. Cada ocorrência registrada nas **últimas 24 horas** desconta pontos conforme o impacto informado:

| Impacto | Penalidade |
|---|---|
| Baixo | −0,3 |
| Médio | −0,7 |
| Alto | −1,5 |

A penalidade vai diminuindo com o tempo: uma ocorrência recém-criada vale 100% e, perto das 24 horas, vale 50%. Depois de 24 horas ela deixa de entrar no cálculo, mas continua registrada.

## Exemplo

Clima de 27 °C, vento de 14 km/h, 10% de chance de chuva e sem chuva agora: nenhuma penalidade, então a nota do clima é **5,0**. Há uma ocorrência de impacto alto recém-registrada: a nota das ocorrências é 5 − 1,5 = **3,5**.

```
índice = 0,6 × 5,0 + 0,4 × 3,5 = 4,4  →  Ótimo
```

## Limitações e referências

- Os limites e as penalidades foram definidos por critério próprio, de forma explicável, e não vêm de um estudo. Eles não foram validados com a percepção de usuários.
- A ideia de combinar fatores de clima em uma nota de conforto é conceitualmente próxima de índices consagrados, como o *Tourism Climate Index* (Mieczkowski, 1985), a escala Beaufort para o vento e os índices de conforto térmico (UTCI, PET). **Eles serviram só de inspiração:** os pesos e limites do sistema não foram derivados desses trabalhos.
- Os códigos de tempo seguem a tabela WMO usada pela Open-Meteo.
- As ocorrências são informadas por usuários e não são verificadas.
- O índice é uma estimativa de apoio e não substitui avisos oficiais (como os da Defesa Civil).
