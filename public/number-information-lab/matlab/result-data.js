window.MUZE_MATLAB_RESULT = {
  schema_version: "0.1.0",
  result_id: "MUZEX-NUM-MATLAB-0001",
  status: "REL",
  matlab_validation: "PENDING_PRIVATE_RUN",
  title: "Multiples de 9, partitions exponentielles et changement de base",
  decimal: {
    tested_positive_multiples_of_9: 1000,
    all_digital_roots_equal_9: true,
    sample_values: [90, 99, 108, 117, 126, 135, 144, 153, 162, 171, 180, 189],
    sample_digit_sums: [9, 18, 9, 9, 9, 9, 9, 9, 9, 9, 9, 18],
    sample_digital_roots: [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9]
  },
  log_exp: {
    base: 9,
    signatures: [[1, 0, 8], [8, 0, 1], [4, 0, 5], [3, 3, 3], [2, 0, 7]],
    signature_sums: [9, 9, 9, 9, 9],
    additive_power_projection: [43046731, 43046731, 65611, 2187, 4783051],
    multiplicative_power_projection: [387420489, 387420489, 387420489, 387420489, 387420489],
    common_product: 387420489,
    identity: "prod(9^d_i) = 9^sum(d_i)"
  },
  mirror: {
    left_signature: [1, 0, 8],
    right_signature: [8, 0, 1],
    same_additive_projection: true,
    same_multiplicative_projection: true
  },
  base_change: [
    { base: 8, modulus: 7, tested_positive_multiples: 250, congruence_verified: true },
    { base: 10, modulus: 9, tested_positive_multiples: 250, congruence_verified: true },
    { base: 12, modulus: 11, tested_positive_multiples: 250, congruence_verified: true },
    { base: 16, modulus: 15, tested_positive_multiples: 250, congruence_verified: true }
  ],
  boundaries: [
    "La racine numérique 9 est une propriété de la représentation décimale.",
    "En base B, la congruence de somme des chiffres porte sur B−1.",
    "La correspondance addition ↔ multiplication par log/exp est générale.",
    "Une concordance numérique ne constitue pas une loi physique.",
    "Aucun lien avec les zéros de zêta ou l’hypothèse de Riemann n’est revendiqué."
  ]
};
