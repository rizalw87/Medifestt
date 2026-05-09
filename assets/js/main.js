(function () {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector("body");
    const selectHeader = document.querySelector("#header");
    if (
      !selectHeader ||
      (!selectHeader.classList.contains("scroll-up-sticky") &&
        !selectHeader.classList.contains("sticky-top") &&
        !selectHeader.classList.contains("fixed-top"))
    )
      return;

    window.scrollY > 100
      ? selectBody.classList.add("scrolled")
      : selectBody.classList.remove("scrolled");
  }

  document.addEventListener("scroll", toggleScrolled);
  window.addEventListener("load", toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector(".mobile-nav-toggle");

  function mobileNavToogle() {
    document.querySelector("body").classList.toggle("mobile-nav-active");
    mobileNavToggleBtn.classList.toggle("bi-list");
    mobileNavToggleBtn.classList.toggle("bi-x");
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener("click", mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll("#navmenu a").forEach((navmenu) => {
    navmenu.addEventListener("click", () => {
      if (document.querySelector(".mobile-nav-active")) {
        mobileNavToogle();
      }
    });
  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll(".navmenu .toggle-dropdown").forEach((navmenu) => {
    navmenu.addEventListener("click", function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle("active");
      this.parentNode.nextElementSibling.classList.toggle("dropdown-active");
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector("#preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button (FIX: guard if element doesn't exist)
   */
  let scrollTop = document.querySelector(".scroll-top");

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100
        ? scrollTop.classList.add("active")
        : scrollTop.classList.remove("active");
    }
  }

  if (scrollTop) {
    scrollTop.addEventListener("click", (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  window.addEventListener("load", toggleScrollTop);
  document.addEventListener("scroll", toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: "ease-in-out",
      once: true,
      mirror: false,
    });
  }
  window.addEventListener("load", aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: ".glightbox",
  });

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll(".isotope-layout").forEach(function (isotopeItem) {
    let layout = isotopeItem.getAttribute("data-layout") ?? "masonry";
    let filter = isotopeItem.getAttribute("data-default-filter") ?? "*";
    let sort = isotopeItem.getAttribute("data-sort") ?? "original-order";

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector(".isotope-container"), function () {
      initIsotope = new Isotope(
        isotopeItem.querySelector(".isotope-container"),
        {
          itemSelector: ".isotope-item",
          layoutMode: layout,
          filter: filter,
          sortBy: sort,
        },
      );

      // expose instance for other scripts (doctors custom filters)
      isotopeItem.__isotope = initIsotope;
    });

    isotopeItem
      .querySelectorAll(".isotope-filters li")
      .forEach(function (filters) {
        filters.addEventListener(
          "click",
          function () {
            isotopeItem
              .querySelector(".isotope-filters .filter-active")
              ?.classList.remove("filter-active");
            this.classList.add("filter-active");
            initIsotope.arrange({
              filter: this.getAttribute("data-filter"),
            });
            if (typeof aosInit === "function") {
              aosInit();
            }
          },
          false,
        );
      });
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim(),
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document
    .querySelectorAll(
      ".faq-item h3, .faq-item .faq-toggle, .faq-item .faq-header",
    )
    .forEach((faqItem) => {
      faqItem.addEventListener("click", () => {
        faqItem.parentNode.classList.toggle("faq-active");
      });
    });

  /**
   * Doctors Directory Filters (Search + Department + Location) with Isotope
   */
  document.addEventListener("DOMContentLoaded", function () {
    const section = document.querySelector("#doctors");
    if (!section) return;

    const layoutEl = section.querySelector(".isotope-layout");
    if (!layoutEl) return;

    const getIso = () => layoutEl.__isotope;

    const searchInput = section.querySelector("#doctor-search");
    const selects = section.querySelectorAll(
      ".directory-bar select.form-select",
    );
    const deptSelect = selects[0] || null;
    const locSelect = selects[1] || null;
    const applyBtn = section.querySelector(
      ".directory-bar .btn.btn-appointment",
    );
    const filterTabs = section.querySelectorAll(
      ".directory-filters li[data-filter]",
    );

    const items = Array.from(
      section.querySelectorAll(".isotope-container .doctor-item.isotope-item"),
    );

    const locationByIndex = [
      "klinik pusat kota", // 0
      "klinik area barat", // 1
      "klinik riverside", // 2
      "klinik pusat kota", // 3
      "klinik area barat", // 4
      "klinik riverside", // 5
      "klinik area barat", // 6
      "klinik pusat kota", // 7
    ];

    function normalize(str) {
      return (str || "").toLowerCase().replace(/\s+/g, " ").trim();
    }

    function currentDeptFilter() {
      const v = deptSelect ? deptSelect.value : "*";
      return v || "*";
    }

    function currentLocationFilter() {
      if (!locSelect) return "";
      const txt = normalize(
        locSelect.options[locSelect.selectedIndex]?.textContent,
      );
      return txt.includes("semua lokasi") || txt.includes("all locations")
        ? ""
        : txt;
    }

    function currentSearchQuery() {
      return normalize(searchInput?.value);
    }

    function setActiveTab(filterValue) {
      filterTabs.forEach((li) => {
        const f = li.getAttribute("data-filter") || "*";
        li.classList.toggle("filter-active", f === (filterValue || "*"));
      });
    }

    function applyFilters() {
      const iso = getIso();
      if (!iso) return;

      const deptFilter = currentDeptFilter();
      const locFilter = currentLocationFilter();
      const q = currentSearchQuery();

      iso.arrange({
        filter: function (itemElem) {
          const passDept = deptFilter === "*" || itemElem.matches(deptFilter);

          const name = normalize(
            itemElem.querySelector(".doctor-name")?.textContent,
          );
          const title = normalize(
            itemElem.querySelector(".doctor-title")?.textContent,
          );
          const desc = normalize(
            itemElem.querySelector(".doctor-desc")?.textContent,
          );
          const badge = normalize(
            itemElem.querySelector(".badge.dept")?.textContent,
          );
          const hay = `${name} ${title} ${desc} ${badge}`;
          const passSearch = !q || hay.includes(q);

          let passLoc = true;
          if (locFilter) {
            const idx = items.indexOf(itemElem);
            const loc = normalize(locationByIndex[idx] || "");
            passLoc = loc && loc === locFilter;
          }

          return passDept && passSearch && passLoc;
        },
      });

      if (typeof aosInit === "function") aosInit();
    }

    filterTabs.forEach((li) => {
      li.addEventListener(
        "click",
        function (e) {
          e.stopImmediatePropagation();
        },
        true,
      );
    });

    filterTabs.forEach((li) => {
      li.addEventListener("click", function () {
        const dept = this.getAttribute("data-filter") || "*";
        if (deptSelect) deptSelect.value = dept;
        setActiveTab(dept);
        applyFilters();
      });
    });

    applyBtn?.addEventListener("click", function (e) {
      e.preventDefault();
      applyFilters();
    });

    searchInput?.addEventListener("input", applyFilters);

    deptSelect?.addEventListener("change", function () {
      const v = deptSelect.value || "*";
      setActiveTab(v);
      applyFilters();
    });

    locSelect?.addEventListener("change", applyFilters);

    const waitIso = setInterval(() => {
      if (getIso()) {
        clearInterval(waitIso);
        setActiveTab(currentDeptFilter());
        applyFilters();
      }
    }, 100);

    setTimeout(() => clearInterval(waitIso), 5000);
  });

  /**
   * Contact Form -> WhatsApp
   */
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#contact .php-email-form");
    if (!form) return;

    const waNumber = "6281122223344";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = (form.querySelector('input[name="name"]')?.value || "").trim();
      const email = (form.querySelector('input[name="email"]')?.value || "").trim();
      const subject = (form.querySelector('input[name="subject"]')?.value || "").trim();
      const message = (form.querySelector('textarea[name="message"]')?.value || "").trim();

      if (!name || !email || !subject || !message) {
        const err = form.querySelector(".error-message");
        if (err) err.textContent = "Mohon lengkapi semua kolom sebelum mengirim.";
        return;
      }

      const text =
        `Halo Admin, saya ingin menghubungi.\n\n` +
        `Nama: ${name}\n` +
        `Email: ${email}\n` +
        `Subjek: ${subject}\n\n` +
        `Pesan:\n${message}`;

      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

      const loading = form.querySelector(".loading");
      if (loading) loading.style.display = "block";

      window.open(url, "_blank", "noopener");

      const sent = form.querySelector(".sent-message");
      if (sent) sent.style.display = "block";
      if (loading) loading.style.display = "none";
      form.reset();
    });
  });

  /**
   * Appointment Form (PAGE + MODAL) -> WhatsApp
   * Selector dibuat GLOBAL supaya form bisa dipakai di appointment.html atau di modal service-details.html
   */
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".appointment-form.php-email-form");
    if (!form) return;

    const waNumber = "6281122223344";

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const name = (form.querySelector('input[name="name"]')?.value || "").trim();
      const email = (form.querySelector('input[name="email"]')?.value || "").trim();
      const phone = (form.querySelector('input[name="phone"]')?.value || "").trim();
      const date = (form.querySelector('input[name="date"]')?.value || "").trim();

      const deptSelect = form.querySelector('select[name="department"]');
      const doctorSelect = form.querySelector('select[name="doctor"]');

      const department = (deptSelect?.options[deptSelect.selectedIndex]?.textContent || "").trim();
      const doctor = (doctorSelect?.options[doctorSelect.selectedIndex]?.textContent || "").trim();

      const message = (form.querySelector('textarea[name="message"]')?.value || "").trim();

      if (!name || !email || !phone || !date || !department || !doctor) {
        const err = form.querySelector(".error-message");
        if (err) err.textContent = "Mohon lengkapi semua kolom wajib sebelum mengirim.";
        return;
      }

      const text =
        `Halo Admin, saya ingin buat janji konsultasi.\n\n` +
        `Nama: ${name}\n` +
        `Email: ${email}\n` +
        `No. WA: ${phone}\n` +
        `Poli: ${department}\n` +
        `Dokter: ${doctor}\n` +
        `Tanggal: ${date}\n\n` +
        `Keluhan/Tujuan:\n${message || "-"}`;

      const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

      const loading = form.querySelector(".loading");
      const sent = form.querySelector(".sent-message");
      const err = form.querySelector(".error-message");
      if (err) err.textContent = "";
      if (sent) sent.style.display = "none";
      if (loading) loading.style.display = "block";

      window.open(url, "_blank", "noopener");

      if (loading) loading.style.display = "none";
      if (sent) sent.style.display = "block";

      form.reset();
    });
  });

  /**
   * Appointment: Doctor dropdown depends on Department (PAGE + MODAL)
   */
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".appointment-form.php-email-form");
    if (!form) return;

    const deptSelect = form.querySelector('select[name="department"]');
    const doctorSelect = form.querySelector('select[name="doctor"]');
    if (!deptSelect || !doctorSelect) return;

    const doctorsByDept = {
      ".filter-cardiology": [
        { value: "dr-aulia-putri", label: "dr. Aulia Putri" },
        { value: "dr-kevin-santoso", label: "dr. Kevin Santoso" },
      ],
      ".filter-pediatrics": [
        { value: "dr-nadia-lestari", label: "dr. Nadia Lestari" },
        { value: "dr-bima-pratama", label: "dr. Bima Pratama" },
      ],
      ".filter-dermatology": [
        { value: "dr-sinta-maharani", label: "dr. Sinta Maharani" },
        { value: "dr-aisyah-rahma", label: "dr. Aisyah Rahma" },
      ],
      ".filter-orthopedics": [
        { value: "dr-raka-wirawan", label: "dr. Raka Wirawan" },
        { value: "dr-rafi-alamsyah", label: "dr. Rafi Alamsyah" },
      ],
    };

    const allDoctors = [
      { value: "dr-aulia-putri", label: "dr. Aulia Putri" },
      { value: "dr-nadia-lestari", label: "dr. Nadia Lestari" },
      { value: "dr-sinta-maharani", label: "dr. Sinta Maharani" },
      { value: "dr-raka-wirawan", label: "dr. Raka Wirawan" },
      { value: "dr-kevin-santoso", label: "dr. Kevin Santoso" },
      { value: "dr-bima-pratama", label: "dr. Bima Pratama" },
      { value: "dr-aisyah-rahma", label: "dr. Aisyah Rahma" },
      { value: "dr-rafi-alamsyah", label: "dr. Rafi Alamsyah" },
    ];

    function renderDoctors(list) {
      doctorSelect.innerHTML = '<option value="">Pilih Dokter</option>';
      list.forEach((d) => {
        const opt = document.createElement("option");
        opt.value = d.value;
        opt.textContent = d.label;
        doctorSelect.appendChild(opt);
      });
    }

    function updateDoctors() {
      const dept = deptSelect.value;
      if (!dept || dept === "*") {
        renderDoctors(allDoctors);
        return;
      }
      renderDoctors(doctorsByDept[dept] || []);
    }

    updateDoctors();
    deptSelect.addEventListener("change", updateDoctors);
  });

  /**
   * Appointment: date min = today (PAGE + MODAL)
   */
  document.addEventListener("DOMContentLoaded", function () {
    const dateInput = document.querySelector('input[type="date"][name="date"]');
    if (!dateInput) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    dateInput.min = `${yyyy}-${mm}-${dd}`;
  });

  /**
   * Optional: reset message when modal opened (if modal exists)
   */
  document.addEventListener("DOMContentLoaded", function () {
    const modalEl = document.getElementById("appointmentModal");
    if (!modalEl) return;

    modalEl.addEventListener("show.bs.modal", function () {
      const form = modalEl.querySelector(".appointment-form.php-email-form");
      if (!form) return;

      const loading = form.querySelector(".loading");
      const sent = form.querySelector(".sent-message");
      const err = form.querySelector(".error-message");

      if (loading) loading.style.display = "none";
      if (sent) sent.style.display = "none";
      if (err) err.textContent = "";
    });
  });
})();