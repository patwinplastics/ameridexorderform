 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/docs/app.js b/docs/app.js
index 8b137891791fe96927ad78e64b0aad7bded08bdc..a22ebe282cb4bed83e8db21a18b0ef69bb8c9730 100644
--- a/docs/app.js
+++ b/docs/app.js
@@ -1 +1,133 @@
+const sameAsCustomerCheckbox = document.getElementById('same-as-customer');
+const customerFields = {
+  street: document.getElementById('cust-street'),
+  city: document.getElementById('cust-city'),
+  state: document.getElementById('cust-state'),
+  zip: document.getElementById('cust-zip')
+};
+const shippingFields = {
+  street: document.getElementById('ship-street'),
+  city: document.getElementById('ship-city'),
+  state: document.getElementById('ship-state'),
+  zip: document.getElementById('ship-zip')
+};
 
+const lineItemRows = Array.from(document.querySelectorAll('.line-item'));
+const grandTotalInput = document.getElementById('grand-total');
+
+const parseNumber = (value) => {
+  if (value === '' || value === null || value === undefined) {
+    return null;
+  }
+  const parsed = Number.parseFloat(value);
+  return Number.isNaN(parsed) ? null : parsed;
+};
+
+const setShippingDisabled = (isDisabled) => {
+  Object.values(shippingFields).forEach((field) => {
+    field.disabled = isDisabled;
+  });
+};
+
+const syncShippingFromCustomer = () => {
+  Object.entries(customerFields).forEach(([key, field]) => {
+    if (sameAsCustomerCheckbox.checked) {
+      shippingFields[key].value = field.value;
+    }
+  });
+};
+
+const handleSameAsCustomerChange = () => {
+  const isChecked = sameAsCustomerCheckbox.checked;
+  setShippingDisabled(isChecked);
+  if (isChecked) {
+    syncShippingFromCustomer();
+  }
+};
+
+const updateLineItemSubtotal = (row) => {
+  const qtyInput = row.querySelector('input[name$="_qty"]');
+  const unitInput = row.querySelector('input[name$="_unit"]');
+  const subtotalInput = row.querySelector('input[name$="_subtotal"]');
+
+  if (!qtyInput || !unitInput || !subtotalInput) {
+    return;
+  }
+
+  const qtyValue = parseNumber(qtyInput.value);
+  const unitValue = parseNumber(unitInput.value);
+
+  if (qtyValue === null && unitValue === null) {
+    subtotalInput.value = '';
+    return;
+  }
+
+  const safeQty = qtyValue ?? 0;
+  const safeUnit = unitValue ?? 0;
+  const subtotal = safeQty * safeUnit;
+  subtotalInput.value = subtotal.toFixed(2);
+};
+
+const updateGrandTotal = () => {
+  const total = lineItemRows.reduce((accumulator, row) => {
+    const subtotalInput = row.querySelector('input[name$="_subtotal"]');
+    if (!subtotalInput) {
+      return accumulator;
+    }
+    const subtotalValue = parseNumber(subtotalInput.value);
+    if (subtotalValue === null) {
+      return accumulator;
+    }
+    return accumulator + subtotalValue;
+  }, 0);
+
+  if (total === 0) {
+    grandTotalInput.value = '';
+    return;
+  }
+
+  grandTotalInput.value = total.toFixed(2);
+};
+
+const attachLineItemListeners = () => {
+  lineItemRows.forEach((row) => {
+    const qtyInput = row.querySelector('input[name$="_qty"]');
+    const unitInput = row.querySelector('input[name$="_unit"]');
+    const subtotalInput = row.querySelector('input[name$="_subtotal"]');
+
+    if (qtyInput) {
+      qtyInput.addEventListener('input', () => {
+        updateLineItemSubtotal(row);
+        updateGrandTotal();
+      });
+    }
+
+    if (unitInput) {
+      unitInput.addEventListener('input', () => {
+        updateLineItemSubtotal(row);
+        updateGrandTotal();
+      });
+    }
+
+    if (subtotalInput) {
+      subtotalInput.addEventListener('input', updateGrandTotal);
+    }
+  });
+};
+
+const attachCustomerListeners = () => {
+  Object.values(customerFields).forEach((field) => {
+    field.addEventListener('input', syncShippingFromCustomer);
+  });
+};
+
+const initializeForm = () => {
+  handleSameAsCustomerChange();
+  attachCustomerListeners();
+  attachLineItemListeners();
+  updateGrandTotal();
+};
+
+sameAsCustomerCheckbox.addEventListener('change', handleSameAsCustomerChange);
+
+document.addEventListener('DOMContentLoaded', initializeForm);
 
EOF
)
