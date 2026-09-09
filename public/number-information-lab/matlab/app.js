(() => {
  const data = window.MUZE_MATLAB_RESULT;
  if (!data) return;

  const byId = (id) => document.getElementById(id);
  const fr = new Intl.NumberFormat('fr-FR');

  byId('result-id').textContent = data.result_id;
  byId('result-status').textContent = data.status;
  byId('matlab-status').textContent = data.matlab_validation;
  byId('tested-count').textContent = fr.format(data.decimal.tested_positive_multiples_of_9);
  byId('common-product').textContent = fr.format(data.log_exp.common_product);

  const sampleBody = byId('sample-body');
  data.decimal.sample_values.forEach((value, index) => {
    const tr = document.createElement('tr');
    [
      value,
      data.decimal.sample_digit_sums[index],
      data.decimal.sample_digital_roots[index]
    ].forEach((cell) => {
      const td = document.createElement('td');
      td.textContent = fr.format(cell);
      tr.appendChild(td);
    });
    sampleBody.appendChild(tr);
  });

  const signatureBody = byId('signature-body');
  data.log_exp.signatures.forEach((signature, index) => {
    const tr = document.createElement('tr');
    const values = [
      `(${signature.join(',')})`,
      data.log_exp.signature_sums[index],
      data.log_exp.additive_power_projection[index],
      data.log_exp.multiplicative_power_projection[index]
    ];
    values.forEach((value, cellIndex) => {
      const td = document.createElement('td');
      td.textContent = cellIndex === 0 ? value : fr.format(value);
      tr.appendChild(td);
    });
    signatureBody.appendChild(tr);
  });

  const baseBody = byId('base-body');
  data.base_change.forEach((entry) => {
    const tr = document.createElement('tr');
    [entry.base, entry.modulus, entry.tested_positive_multiples, entry.congruence_verified ? 'SAT' : 'DIVERGENCE'].forEach((value) => {
      const td = document.createElement('td');
      td.textContent = typeof value === 'number' ? fr.format(value) : value;
      tr.appendChild(td);
    });
    baseBody.appendChild(tr);
  });

  const boundaryList = byId('boundary-list');
  data.boundaries.forEach((boundary) => {
    const li = document.createElement('li');
    li.textContent = boundary;
    boundaryList.appendChild(li);
  });
})();
