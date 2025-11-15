import React from 'react';

const iconProps = {
  className: "w-5 h-5",
  strokeWidth: 1.5,
  stroke: "currentColor",
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const DashboardIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h6v8h-6z" /><path d="M4 16h6v4h-6z" /><path d="M14 12h6v8h-6z" /><path d="M14 4h6v4h-6z" /></svg>
);
export const PosIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 18h-8a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v4" /><path d="M12 14v-10" /><path d="M3 14h9" /><path d="M18 22l3.35 -3.284a2.143 2.143 0 0 0 .005 -3.071a2.242 2.242 0 0 0 -3.129 -.006l-.224 .22l-.223 -.22a2.242 2.242 0 0 0 -3.128 -.006a2.143 2.143 0 0 0 -.006 3.071l3.355 3.296z" /></svg>
);
export const SalesIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M9 17h6" /><path d="M9 13h6" /></svg>
);
export const PurchasesIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M12 11h-1v6h1" /><path d="M11 11h-1v6" /><path d="M15 11h-1v6h1" /><path d="M14 11h-1v6" /></svg>
);
export const InventoryIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-8 4l8 4l8 -4l-8 -4" /><path d="M4 12l8 4l8 -4" /><path d="M4 16l8 4l8 -4" /></svg>
);
export const CustomersIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /></svg>
);
export const HRIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" /></svg>
);
export const AttendanceIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h.5" /><path d="M18 18a3 3 0 1 0 0 -6a3 3 0 0 0 0 6z" /><path d="M20.2 20.2l1.8 1.8" /></svg>
);
export const MenuIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
);
export const RecipesIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" /></svg>
);
export const KitchenIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h18" /><path d="M4 6h16" /><path d="M9 6v12" /><path d="M15 6v12" /></svg>
);
export const DeliveryIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M5 17h-2v-4.4a1 1 0 0 1 1 -1h1" /><path d="M9 17v-5a1 1 0 0 0 -1 -1h-1" /><path d="M19 17h2v-4.4a1 1 0 0 0 -1 -1h-1" /><path d="M15 17v-5a1 1 0 0 1 1 -1h1" /><path d="M8 12h8" /><path d="M16 8l-4 -4l-4 4" /></svg>
);
export const BranchesIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 11l-3 -3l-3 3" /><path d="M12 19v-8" /><path d="M8 11h-4v9h16v-9h-4" /><path d="M16 5l-4 -4l-4 4" /></svg>
);
export const PnlIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /><path d="M5 3v18" /><path d="M19 3v18" /></svg>
);
export const ReportsIcon = () => (
    <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h5.697" /><path d="M18 14v4h4" /><path d="M18 11h-4a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M8 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M14 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /></svg>
);
export const DailyOpsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M16 19h6" /><path d="M19 16v6" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /></svg>
);
export const SettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
);
export const SunIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
);
export const MoonIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
);
export const LanguageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 13-4-4-4 4M19 17v-2a4 4 0 00-4-4H9" /></svg>
);
export const ChevronUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
);
export const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
);
export const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
);
export const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
);
export const TrashIcon = () => (
  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);
export const MenuAlt2Icon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
);
export const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
);
export const FilterIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 11h12m-9 7h6" /></svg>
);
export const GeneralSettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M3.6 9l16.8 0" /><path d="M3.6 15l16.8 0" /><path d="M11.5 3a17 17 0 0 0 0 18" /><path d="M12.5 3a17 17 0 0 1 0 18" /></svg>
);
export const FinancialSettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5m0 3a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3z" /><path d="M3 10l18 0" /><path d="M7 15l.01 0" /><path d="M11 15l2 0" /></svg>
);
export const UsersSettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /><path d="M21 21v-2a4 4 0 0 0 -3 -3.85" /></svg>
);
export const InventorySettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" /><path d="M16 5.25l-8 4.5" /></svg>
);
export const LoyaltySettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572" /></svg>
);
export const IntegrationsSettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 4h-2v4h-4v2h4v4h2v-4h4v-2h-4z" /><path d="M3 7h1v10h6v4h4v-4h6v-10h1" /></svg>
);
export const SecuritySettingsIcon = () => (
  <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.46 20.846a12 12 0 0 1 -7.96 -14.846a12 12 0 0 0 8.5 15a12 12 0 0 0 8.5 -15a12 12 0 0 1 -7.96 14.846" /><path d="M9 12l2 2l4 -4" /></svg>
);
export const BrandingIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M11.5 21a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5 -2.5" /><path d="M12 3v16" /><path d="M16.5 10a4.5 4.5 0 1 0 -9 0" /></svg>
export const HardwareIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
export const DiningIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 20v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14" /><path d="M3 12h18" /><path d="M3 16h18" /><path d="M16 4v16" /></svg>
export const PermissionsIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 21h-6a2 2 0 0 1 -2 -2v-6a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v.5" /><path d="M17 14.5m-2.5 0a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0" /><path d="M18.5 14.5l1.5 1.5" /><path d="M13 11v-2l1.293 -1.293a1 1 0 0 1 1.414 0l.293 .293" /></svg>
export const PolicyIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M9 14l2 2l4 -4" /></svg>
export const ColorSwatchIcon = () => <svg {...iconProps} className="w-6 h-6"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M19 3h-4a2 2 0 0 0 -2 2v12a4 4 0 0 0 8 0v-12a2 2 0 0 0 -2 -2" /><path d="M13 7.35l-2 -2a2 2 0 0 0 -2.828 0l-2.828 2.828a2 2 0 0 0 0 2.828l9 9" /><path d="M7.3 13h-2.3a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2 -2v-2.3" /><path d="M13 17l5 -5" /></svg>
export const CreateIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M12 11l0 6" /><path d="M9 14l6 0" /></svg>
export const StarIcon = ({ isFavorite = false }) => <svg {...iconProps} className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873z" /></svg>
export const PdfIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 8v8h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-2z" /><path d="M3 12h2a2 2 0 1 0 0 -4h-2v8" /><path d="M17 12h3" /><path d="M20 8v8" /></svg>
export const CsvIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 15a1 1 0 0 0 1 1h2a1 1 0 0 0 1 -1v-6a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v6z" /><path d="M17 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2" /><path d="M3 8h2a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1z" /></svg>
export const ScheduleIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 12l3 2" /><path d="M12 7v5" /></svg>
export const DownloadIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
export const BarChartIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12l0 8" /><path d="M9 8l0 12" /><path d="M15 4l0 16" /><path d="M21 12l0 8" /></svg>
export const LineChartIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 18l5 -5l4 4l8 -8" /></svg>
export const PieChartIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 3.2a9 9 0 1 0 10.8 10.8a1 1 0 0 0 -1 -1h-3.8a1 1 0 0 0 -1 1a4.2 4.2 0 1 1 -4.2 -4.2a1 1 0 0 0 1 -1v-3.8" /><path d="M12 12l5 5" /></svg>
export const AIIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 16.5l-3 -3l3 -3" /><path d="M14 16.5l3 -3l-3 -3" /><path d="M12 21l0 -1.5" /><path d="M9.5 18.2l-1.4 -1.4" /><path d="M4.8 13.5l-1.3 0" /><path d="M4.8 10.5l-1.3 0" /><path d="M8.1 5.8l-1.4 -1.4" /><path d="M12 3l0 1.5" /><path d="M15.9 5.8l1.4 -1.4" /><path d="M19.2 10.5l1.3 0" /><path d="M19.2 13.5l1.3 0" /><path d="M14.5 18.2l1.4 -1.4" /></svg>
export const FxIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 17h-2a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h3" /><path d="M16 7h2a2 2 0 0 1 2 2v2" /><path d="M12 7v10" /><path d="M10 13l-2.5 -2.5" /><path d="M7.5 15.5l2.5 -2.5" /><path d="M15 13h5" /><path d="M17.5 10l-2.5 6" /></svg>
export const ShareIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 6m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>
export const ExcelIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M8 11l4 6l4 -6" /><path d="M10 17l4 0" /></svg>
export const ConditionalFormattingIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 12h16" /><path d="M10 18h4" /><path d="M12 12v6" /><path d="M3 3m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v2a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" /><path d="M5 6h1" /><path d="M9 6h1" /><path d="M13 6h1" /></svg>
export const OrgChartIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 11v-5a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v5" /><path d="M13 11v-5a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v5" /><path d="M7 11v2a2 2 0 0 0 2 2h6a2 2 0 0 0 2 -2v-2" /><path d="M12 15v6" /><path d="M9 18h6" /></svg>
export const LeaveIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>
export const PayrollIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 5h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2h-2" /><path d="M9 3m0 2a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-2a2 2 0 0 1 -2 -2z" /><path d="M10 14h4" /><path d="M12 12v4" /></svg>
export const DocumentIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /></svg>
export const BirthdayIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 21l8 0" /><path d="M12 17l0 4" /><path d="M12 12a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" /><path d="M12 4a2 2 0 1 0 2 2" /></svg>
export const CalendarIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12z" /><path d="M16 3v4" /><path d="M8 3v4" /><path d="M4 11h16" /></svg>
export const QuotationIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M10 13h1" /><path d="M13 13h1" /><path d="M16 13h1" /></svg>
export const EmailIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" /><path d="M3 7l9 6l9 -6" /></svg>
export const BellIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 5a2 2 0 1 1 4 0a7 7 0 0 1 4 6v3a4 4 0 0 0 2 3h-16a4 4 0 0 0 2 -3v-3a7 7 0 0 1 4 -6" /><path d="M9 17v1a3 3 0 0 0 6 0v-1" /></svg>
export const CheckCircleIcon = () => <svg {...iconProps} className="w-5 h-5 text-green-500"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 12l2 2l4 -4" /></svg>
export const InfoIcon = () => <svg {...iconProps} className="w-5 h-5 text-blue-500"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9h.01" /><path d="M11 12h1v4h1" /></svg>
export const WarningIcon = () => <svg {...iconProps} className="w-5 h-5 text-yellow-500"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9v4" /><path d="M12 16h.01" /></svg>
export const ErrorIcon = () => <svg {...iconProps} className="w-5 h-5 text-red-500"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9v4" /><path d="M12 16h.01" /></svg>
export const CloseIcon = () => <svg className="w-4 h-4" stroke="currentColor" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
export const EmptyBoxIcon = () => <svg className="w-16 h-16 mx-auto text-muted-foreground/50" {...iconProps} strokeWidth="1"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3l8 4.5l0 9l-8 4.5l-8 -4.5l0 -9l8 -4.5" /><path d="M12 12l8 -4.5" /><path d="M12 12l0 9" /><path d="M12 12l-8 -4.5" /><path d="M16 5.25l-8 4.5" /></svg>
export const StockIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 18h16" /><path d="M4 14h16" /><path d="M4 10h16" /><path d="M4 6h16" /></svg>
export const FloorPlanIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 5m0 1a1 1 0 0 1 1 -1h14a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-14a1 1 0 0 1 -1 -1z" /><path d="M8 8h2v2h-2z" /><path d="M8 14h2v2h-2z" /><path d="M14 8h2v2h-2z" /><path d="M14 14h2v5h-2z" /></svg>
export const GridViewIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h6v6h-6z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6h-6z" /><path d="M14 14h6v6h-6z" /></svg>
export const SplitBillIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12v-8" /><path d="M6.71 6.706a7 7 0 1 0 9.586 9.587" /><path d="M3 12h9" /><path d="M13.4 15.3l-1.4 1.7" /><path d="M16 18l-3 -1" /><path d="M18.7 19.3l-3.7 -0.3" /></svg>
export const MergeTablesIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M2 11h5l3 3l3 -3h5" /><path d="M11 14v7" /><path d="M8 11v-7h6v7" /></svg>
export const GiftCardIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 5h-9a3 3 0 0 0 -3 3v8a3 3 0 0 0 3 3h9a3 3 0 0 0 3 -3v-8a3 3 0 0 0 -3 -3" /><path d="M18 10a2 2 0 1 0 -4 0a2 2 0 0 0 4 0z" /><path d="M3 11h5" /><path d="M8 11v-1a2 2 0 0 1 2 -2h2" /></svg>
export const AddCustomerIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" /><path d="M6 21v-2a4 4 0 0 1 4 -4h4" /><path d="M19 22v-6" /><path d="M22 19l-6 0" /></svg>
export const PrintIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" /><path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" /><path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" /></svg>
export const SyncIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" /><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" /></svg>
export const LogoutIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>
export const UserCircleIcon = () => <svg {...iconProps}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 10m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M6.168 18.849a4 4 0 0 1 3.832 -2.849h4a4 4 0 0 1 3.834 2.855" /></svg>
