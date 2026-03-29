import { useMemo, useState } from "react";

export default function LineaOrderWebsite() {
  const [lang, setLang] = useState("en");

  const t = (en, es) => (lang === "en" ? en : es);
  const formatPickupDate = (date) => {
    if (lang === "en") return date;
    return date.replace("Monday", "Lunes").replace("Wednesday", "Miércoles").replace("Saturday", "Sábado");
  };
  const pickupDates = [
    "Monday (March 30)",
    "Wednesday (April 1)",
    "Saturday (April 4)",
    "Monday (April 6)",
    "Wednesday (April 8)",
    "Saturday (April 11)",
  ];

  const prices = {
    flight: 45,
    core: 7,
    signature: 8,
    limited: 8,
    altMilkUpcharge: 0.5,
    salesTaxRate: 0.0825,
  };

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    instagram: "",
    pickupDate: "",
    pickupWindow: "",
    flightQty: 0,
    vanilla: 0,
    caramel: 0,
    origen: 0,
    houseBlend: 0,
    toastedCoconut: 0,
    caramelizedBanana: 0,
    whiteChocolate: 0,
    milk: "Whole Milk (standard)",
    notes: "",
    zelleSent: false,
    zelleName: "",
    zellePhoneLast4: "",
    acknowledgment: false,
  });

  const [status, setStatus] = useState({
    submitting: false,
    submitted: false,
    error: "",
    copiedRecipient: false,
    copiedReference: false,
  });

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykrkx3afoNEZU7oTJl0V0Z3axvlGwMkg0sySTyLm0YCMAPZ2cJtgJbYHqJAt3FQWGe/exec";

  const setValue = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const bottleCount =
    Number(form.flightQty || 0) * 7 +
    Number(form.vanilla || 0) +
    Number(form.caramel || 0) +
    Number(form.origen || 0) +
    Number(form.houseBlend || 0) +
    Number(form.toastedCoconut || 0) +
    Number(form.caramelizedBanana || 0) +
    Number(form.whiteChocolate || 0);

  const subtotal =
    Number(form.flightQty || 0) * prices.flight +
    Number(form.vanilla || 0) * prices.core +
    Number(form.caramel || 0) * prices.core +
    Number(form.origen || 0) * prices.core +
    Number(form.houseBlend || 0) * prices.signature +
    Number(form.toastedCoconut || 0) * prices.limited +
    Number(form.caramelizedBanana || 0) * prices.limited +
    Number(form.whiteChocolate || 0) * prices.limited;

  const milkUpcharge = form.milk.includes("+$0.50") ? bottleCount * prices.altMilkUpcharge : 0;
  const taxableSubtotal = subtotal + milkUpcharge;
  const salesTax = taxableSubtotal * prices.salesTaxRate;
  const total = taxableSubtotal + salesTax;
  const paymentReference = `${form.fullName || "LINEA"} • ${form.pickupDate || "Pickup"}`;

  const summaryItems = useMemo(
    () => [
      { label: "Full LINEA Coffee Flight", qty: Number(form.flightQty || 0), price: prices.flight },
      { label: "Vanilla", qty: Number(form.vanilla || 0), price: prices.core },
      { label: "Caramel", qty: Number(form.caramel || 0), price: prices.core },
      { label: "Origen", qty: Number(form.origen || 0), price: prices.core },
      { label: "House Blend", qty: Number(form.houseBlend || 0), price: prices.signature },
      { label: "Toasted Coconut", qty: Number(form.toastedCoconut || 0), price: prices.limited },
      { label: "Caramelized Banana", qty: Number(form.caramelizedBanana || 0), price: prices.limited },
      { label: "White Chocolate", qty: Number(form.whiteChocolate || 0), price: prices.limited },
    ].filter((item) => item.qty > 0),
    [form]
  );

  const validateForm = () => {
    if (!form.email || !form.fullName || !form.phone || !form.pickupDate || !form.pickupWindow) {
      return t("Please complete your contact and pickup details.", "Por favor completa tus datos de contacto y recogida.");
    }
    if (summaryItems.length === 0) {
      return t("Please add at least one item to your order.", "Por favor agrega al menos un artículo a tu pedido.");
    }
    if (!form.zelleSent) {
      return t("Please send payment via Zelle before submitting your order.", "Por favor envía el pago por Zelle antes de enviar tu pedido.");
    }
    if (!form.zelleName.trim()) {
      return t("Please enter the Zelle payment name used for your payment.", "Por favor ingresa el nombre usado en Zelle para tu pago.");
    }
    if (!form.acknowledgment) {
      return t("Please confirm your understanding before submitting your order.", "Por favor confirma que entiendes antes de enviar tu pedido.");
    }
    return "";
  };

  const copyText = async (value, key) => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => {
        setStatus((prev) => ({ ...prev, [key]: false }));
      }, 1800);
    } catch {
      setStatus((prev) => ({
        ...prev,
        error: t("Unable to copy right now. Please copy manually.", "No se puede copiar en este momento. Por favor copia manualmente."),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setStatus((prev) => ({ ...prev, submitting: false, submitted: false, error: validationError }));
      return;
    }

    setStatus((prev) => ({ ...prev, submitting: true, submitted: false, error: "" }));

    const payload = {
      timestamp: new Date().toISOString(),
      email: form.email,
      fullName: form.fullName,
      phone: form.phone,
      instagram: form.instagram,
      pickupDate: form.pickupDate,
      pickupWindow: form.pickupWindow,
      flightQty: Number(form.flightQty || 0),
      vanilla: Number(form.vanilla || 0),
      caramel: Number(form.caramel || 0),
      origen: Number(form.origen || 0),
      houseBlend: Number(form.houseBlend || 0),
      toastedCoconut: Number(form.toastedCoconut || 0),
      caramelizedBanana: Number(form.caramelizedBanana || 0),
      whiteChocolate: Number(form.whiteChocolate || 0),
      milk: form.milk,
      bottleCount,
      subtotal,
      milkUpcharge,
      salesTax,
      total,
      notes: form.notes,
      zelleSent: form.zelleSent,
      zelleName: form.zelleName,
      zellePhoneLast4: form.zellePhoneLast4,
      acknowledgment: form.acknowledgment,
      status: "Pending",
    };

    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Submission failed");

      setStatus((prev) => ({ ...prev, submitting: false, submitted: true, error: "" }));
    } catch {
      setStatus((prev) => ({
        ...prev,
        submitting: false,
        submitted: false,
        error: t("Unable to submit right now. Please try again in a moment.", "No se puede enviar en este momento. Inténtalo de nuevo en un momento."),
      }));
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-stone-500";
  const sectionClass = "rounded-3xl border border-stone-300 bg-white p-6 shadow-sm";

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 rounded-3xl border border-stone-300 bg-white p-8 shadow-sm">
          <div className="mb-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`rounded-full px-3 py-1 text-sm ${lang === "en" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("es")}
              className={`rounded-full px-3 py-1 text-sm ${lang === "es" ? "bg-black text-white" : "bg-gray-200 text-black"}`}
            >
              ES
            </button>
          </div>
          <h1 className="text-4xl font-light tracking-[0.2em]">{t("LINEA — Order", "LINEA — Orden")}</h1>
          <p className="mt-3 text-lg text-stone-700">{t("Espresso • Milk", "Espresso • Leche")}</p>
          <p className="mt-2 text-sm text-stone-600">{t("Built around Single Origin Coffee.", "Hecho con café de origen único.")}</p>
          <div className="mt-5 space-y-1 text-sm text-stone-600">
            <p className="font-medium text-stone-800">{t("Current Coffee Feature", "Café destacado actual")}</p>
            <p>Guatemala Ella Todos Santos</p>
            <p>{t("Notes: Marmelade, Hazelnut, Sweet Cream, full body espresso", "Notas: mermelada, avellana, crema dulce, espresso de cuerpo completo")}</p>
            <p>MASL: 1200-1950</p>
            <p>{t("Woman Produce coffee - San Martin Todos Santos, Cuchumatanes - Washed Coffee", "Café producido por mujer - San Martin Todos Santos, Cuchumatanes - café lavado")}</p>
            <p className="pt-2">{t("Local Orders Only - Greater Houston Area.", "Solo pedidos locales - área metropolitana de Houston.")}</p>
            <p>{t("Monday pickup → order by Sunday 10PM", "Recogida lunes → ordena antes del domingo 10PM")}</p>
            <p>{t("Wednesday pickup → order by Tuesday 10PM", "Recogida miércoles → ordena antes del martes 10PM")}</p>
            <p>{t("Saturday pickup → order by Friday 10PM", "Recogida sábado → ordena antes del viernes 10PM")}</p>
            <p className="pt-2 font-medium text-stone-800">{t("12 oz Bottles", "Botellas de 12 oz")}</p>
            <p>{t("Shake Well • Keep Refrigerated", "Agitar bien • Mantener refrigerado")}</p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_0.95fr]">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Order Details", "Detalles del Pedido")}</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium">{t("Email", "Correo electrónico")}</span>
                  <input className={inputClass} type="email" placeholder={t("Enter your email", "Ingresa tu correo electrónico")} value={form.email} onChange={(e) => setValue("email", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">{t("Full name", "Nombre completo")}</span>
                  <input className={inputClass} placeholder={t("Enter your full name", "Ingresa tu nombre completo")} value={form.fullName} onChange={(e) => setValue("fullName", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">{t("Phone number", "Número de teléfono")}</span>
                  <input className={inputClass} placeholder={t("Enter your phone number", "Ingresa tu número de teléfono")} value={form.phone} onChange={(e) => setValue("phone", e.target.value)} />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-2 block text-sm font-medium">{t("Instagram handle (optional)", "Usuario de Instagram (opcional)")}</span>
                  <input className={inputClass} placeholder={t("Enter your Instagram handle", "Ingresa tu usuario de Instagram")} value={form.instagram} onChange={(e) => setValue("instagram", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">{t("Pickup date", "Fecha de recogida")}</span>
                  <select className={inputClass} value={form.pickupDate} onChange={(e) => setValue("pickupDate", e.target.value)}>
                    <option value="">{t("Select", "Selecciona")}</option>
                    {pickupDates.map((date) => (
                      <option key={date}>{formatPickupDate(date)}</option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="mb-2 block text-sm font-medium">{t("Pickup window", "Horario de recogida")}</span>
                  <div className="space-y-3">
                    {["9:00 AM - 10:00 AM", "6:00 PM - 7:00 PM"].map((opt) => (
                      <label key={opt} className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
                        <input type="radio" name="pickupWindow" checked={form.pickupWindow === opt} onChange={() => setValue("pickupWindow", opt)} className="h-4 w-4" />
                        <span className="text-sm">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
                <p className="font-medium text-stone-900">{t("Pickup Location", "Lugar de recogida")}</p>
                <p className="mt-2">3037 Farm to Market 1960 Rd E, Houston, TX 77073</p>
                <p className="mt-1 italic">{t("Capital One parking lot", "Estacionamiento de Capital One")}</p>
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Full LINEA Coffee Flight — $45", "Vuelo Completo LINEA — $45")}</h2>
              <p className="mt-2 text-sm text-stone-600">{t("7 bottle current curated selection. Perfect for first-time orders.", "Selección actual curada de 7 botellas. Perfecta para pedidos por primera vez.")}</p>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium">{t("Quantity", "Cantidad")}</span>
                <input className={inputClass} type="number" min="0" value={form.flightQty} onChange={(e) => setValue("flightQty", e.target.value)} placeholder={t("Enter quantity", "Ingresa la cantidad")} />
              </label>
            </section>

            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Core Series — $7", "Serie Base — $7")}</h2>
              <p className="mt-2 text-sm text-stone-600">{t("Single Origin espresso + milk with subtle flavor.", "Espresso de origen único + leche con sabor sutil.")}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  [t("Vanilla", "Vainilla"), "vanilla", t("Enter quantity", "Ingresa la cantidad")],
                  [t("Caramel", "Caramelo"), "caramel", t("Enter quantity", "Ingresa la cantidad")],
                  [t("Origen", "Origen"), "origen", t("Pure espresso + milk", "Espresso puro + leche")],
                ].map(([label, key, helper]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-medium">{label}</span>
                    <span className="mb-2 block text-xs text-stone-500">{helper}</span>
                    <input className={inputClass} type="number" min="0" value={form[key]} onChange={(e) => setValue(key, e.target.value)} placeholder={t("Enter quantity", "Ingresa la cantidad")} />
                  </label>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Signature Series — $8", "Serie Signature — $8")}</h2>
              <p className="mt-2 text-sm text-stone-600">{t("Our special house blend syrup.", "Nuestro jarabe especial House Blend.")}</p>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium">{t("House Blend", "House Blend")}</span>
                <span className="mb-2 block text-xs text-stone-500">{t("Enter quantity", "Ingresa la cantidad")}</span>
                <input className={inputClass} type="number" min="0" value={form.houseBlend} onChange={(e) => setValue("houseBlend", e.target.value)} placeholder={t("Enter quantity", "Ingresa la cantidad")} />
              </label>
            </section>

            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Limited Series — $8", "Serie Limitada — $8")}</h2>
              <p className="mt-2 text-sm text-stone-600">{t("Rotating expressions.", "Expresiones rotativas.")}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {[
                  [t("Toasted Coconut", "Coco Tostado"), "toastedCoconut"],
                  [t("Caramelized Banana", "Banana Caramelizada"), "caramelizedBanana"],
                  [t("White Chocolate", "Chocolate Blanco"), "whiteChocolate"],
                ].map(([label, key]) => (
                  <label key={key} className="block">
                    <span className="mb-2 block text-sm font-medium">{label}</span>
                    <span className="mb-2 block text-xs text-stone-500">{t("Enter quantity", "Ingresa la cantidad")}</span>
                    <input className={inputClass} type="number" min="0" value={form[key]} onChange={(e) => setValue(key, e.target.value)} placeholder={t("Enter quantity", "Ingresa la cantidad")} />
                  </label>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Milk Preference", "Preferencia de Leche")}</h2>
              <p className="mt-2 text-sm text-stone-600">{t("Whole milk standard. Alternative Milk available +$0.50 per bottle", "Leche entera estándar. Leche alternativa disponible +$0.50 por botella")}</p>
              <div className="mt-4 space-y-3">
                {[t("Whole Milk (standard)", "Leche Entera (estándar)"), t("Oat milk (+$0.50)", "Leche de Avena (+$0.50)"), t("Almond milk (+$0.50)", "Leche de Almendra (+$0.50)")].map((opt) => (
                  <label key={opt} className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3">
                    <input type="radio" name="milk" checked={form.milk === opt} onChange={() => setValue("milk", opt)} className="h-4 w-4" />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Notes (optional)", "Notas (opcional)")}</h2>
              <p className="mt-2 text-sm text-stone-600">{t("All drinks are made as listed. Whole milk standard.", "Todas las bebidas se preparan tal como aparecen. Leche entera estándar.")}</p>
              <label className="mt-4 block">
                <span className="mb-2 block text-sm font-medium">{t("Notes", "Notas")}</span>
                <textarea rows={4} className={inputClass} value={form.notes} onChange={(e) => setValue("notes", e.target.value)} />
              </label>
            </section>

            {status.error && (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {status.error}
              </div>
            )}

            {status.submitted && (
              <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
                <p className="font-medium">{t("Your order has been received.", "Tu pedido ha sido recibido.")}</p>
                <p className="mt-1">{t("We will review your order and confirm payment receipt shortly.", "Revisaremos tu pedido y confirmaremos la recepción del pago en breve.")}</p>
                <p className="mt-1">{t("Total paid", "Total pagado")}: ${total.toFixed(2)}</p>
              </div>
            )}
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Order Summary", "Resumen del Pedido")}</h2>
              <div className="mt-4 space-y-3 text-sm">
                {summaryItems.length === 0 ? (
                  <p className="text-stone-500">{t("No items selected yet.", "Aún no hay artículos seleccionados.")}</p>
                ) : (
                  summaryItems.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-stone-500">{t("Qty", "Cant.")} {item.qty}</p>
                      </div>
                      <p className="font-medium">${(item.qty * item.price).toFixed(2)}</p>
                    </div>
                  ))
                )}
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3">
                  <div>
                    <p className="font-medium">{t("Subtotal", "Subtotal")}</p>
                    <p className="text-stone-500">{t("Items before milk and tax", "Artículos antes de leche e impuesto")}</p>
                  </div>
                  <p className="font-medium">${subtotal.toFixed(2)}</p>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3">
                  <div>
                    <p className="font-medium">{t("Milk selection", "Selección de leche")}</p>
                    <p className="text-stone-500">{form.milk}</p>
                  </div>
                  <p className="font-medium">${milkUpcharge.toFixed(2)}</p>
                </div>
                <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-3">
                  <div>
                    <p className="font-medium">{t("Sales tax", "Impuesto sobre ventas")}</p>
                    <p className="text-stone-500">8.25%</p>
                  </div>
                  <p className="font-medium">${salesTax.toFixed(2)}</p>
                </div>
                <div className="flex items-start justify-between gap-4 pt-1 text-base font-medium">
                  <p>{t("Total", "Total")}</p>
                  <p>${total.toFixed(2)}</p>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className="text-xl font-medium">{t("Payment", "Pago")}</h2>
              <div className="mt-3 space-y-3 text-sm text-stone-700">
                <p>{t("Send the exact total before submitting your order.", "Envíe el total exacto antes de enviar su pedido.")}</p>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <div>
                    <p className="text-xs text-stone-500">{t("Zelle recipient", "Destinatario Zelle")}</p>
                    <p className="font-medium text-stone-900">832-860-0150</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText("832-860-0150", "copiedRecipient")}
                    className="rounded-lg border px-3 py-1 text-xs hover:bg-stone-100"
                  >
                    {status.copiedRecipient ? t("Copied", "Copiado") : t("Copy", "Copiar")}
                  </button>
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <p className="text-xs text-stone-500">{t("Send this amount", "Enviar este monto")}</p>
                  <p className="font-medium text-stone-900">${total.toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2">
                  <div>
                    <p className="text-xs text-stone-500">{t("Payment note", "Nota de pago")}</p>
                    <p className="font-medium text-stone-900">{paymentReference}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyText(paymentReference, "copiedReference")}
                    className="rounded-lg border px-3 py-1 text-xs hover:bg-stone-100"
                  >
                    {status.copiedReference ? t("Copied", "Copiado") : t("Copy", "Copiar")}
                  </button>
                </div>
                <p>{t("Orders are only confirmed after payment is received.", "Los pedidos solo se confirman después de recibir el pago.")}</p>
              </div>

              <div className="mt-5 space-y-4">
                <label className="flex items-center gap-3 rounded-2xl border border-stone-200 px-4 py-3 text-sm">
                  <input type="checkbox" checked={form.zelleSent} onChange={(e) => setValue("zelleSent", e.target.checked)} className="h-4 w-4" />
                  <span>{t("I have sent payment via Zelle", "Ya envié el pago por Zelle")}</span>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">{t("Zelle payment name", "Nombre del pago en Zelle")}</span>
                  <input className={inputClass} value={form.zelleName} onChange={(e) => setValue("zelleName", e.target.value)} />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium">{t("Last 4 digits of phone number used for Zelle (optional)", "Últimos 4 dígitos del número usado en Zelle (opcional)")}</span>
                  <input className={inputClass} value={form.zellePhoneLast4} onChange={(e) => setValue("zellePhoneLast4", e.target.value)} />
                </label>
              </div>

              <section className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <h3 className="text-base font-medium">{t("Order Confirmation", "Confirmación del Pedido")}</h3>
                <p className="mt-2 text-sm text-stone-600">{t("Please confirm your understanding before submitting your order.", "Por favor confirma que entiendes antes de enviar tu pedido.")}</p>
                <label className="mt-4 flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={form.acknowledgment} onChange={(e) => setValue("acknowledgment", e.target.checked)} className="mt-0.5 h-4 w-4" />
                  <span>{t("I understand LINEA orders must be placed before the cutoff time and are confirmed after payment is received.", "Entiendo que los pedidos de LINEA deben realizarse antes de la hora límite y se confirman después de recibir el pago.")}</span>
                </label>
              </section>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={status.submitting}
                className="mt-5 w-full rounded-2xl bg-stone-900 px-6 py-4 text-sm font-medium tracking-wide text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status.submitting ? t("Submitting...", "Enviando...") : t("Submit Order", "Enviar Pedido")}
              </button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}