export const MENU_ITEMS = [
    {
      label: "แผนภูมิหน่วยงานภายใน ตร.",
      subMenu: [
        { label: "แผนภูมิหน่วยงานภายใน ตร.", path: "/chart-internal-police" },
        { label: "แผนภูมิหน่วยงานภายใน บช.ปส", path: "/chart-internal-nsb" },
        { label: "แผนภูมิหน่วยงานภายนอก ตร.", path: "/chart-external-police" },
        { label: "ผู้ใช้งานสูงสุด", path: "/chart-top-users" },
      ]
    },
    {
      label: "รายงานภาพรวม",
      subMenu: [
        { label: "รายงานจุดตรวจ", path: "/overall-checkpoints" },
        { label: "แผนที่", path: "/overall-map" },
        { label: "รายงาน", path: "/overall-report" },
      ]
    },
    {
      label: "สถิติการใช้งาน ",
      subMenu: [
        { label: "สถิติการใช้งาน (หน่วยงาน)", path: "/statistic-usage-agency" },
        { label: "สถิติการใช้งาน (รายบุคคล)", path: "/statistic-usage-person" },
        { label: "Log การใช้งาน", path: "/statistic-usage-log" },
      ]
    },
    {
      label: "สถิติการค้นป้ายทะเบียน ",
      subMenu: [
        { label: "สถิติการค้นป้ายทะเบียน (หน่วยงาน)", path: "/statistic-search-agency-plate" },
        { label: "สถิติการค้นป้ายทะเบียน (รายบุคคล)", path: "/statistic-search-person-plate" },
        { label: "Log การค้นป้ายทะเบียน", path: "/statistic-search-log-plate" },
      ]
    },
  ]