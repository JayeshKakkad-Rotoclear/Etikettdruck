<script lang="ts">
  export let name: string;
  export let size: number = 20;
  export let color: string = 'currentColor';
  export let className: string = '';

  const icons = {
    // Authentication and User Management
    key: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 10V8C7 5.79086 8.79086 4 11 4H13C15.2091 4 17 5.79086 17 8V10M5 12V18C5 19.1046 5.89543 20 7 20H17C18.1046 20 19 19.1046 19 18V12C19 10.8954 18.1046 10 17 10H7C5.89543 10 6.89543 12 5 12Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    delete: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 6H5H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 6 21.1046 6 20V6H19ZM10 11V17M14 11V17" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    warning: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.64 21H20.36A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // File and Folder Icons
    folder: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 7V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V9C20 7.89543 19.1046 7 18 7H12L10 5H6C4.89543 5 4 5.89543 4 7Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Print and Actions
    printer: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9V2C6 1.44772 6.44772 1 7 1H17C17.5523 1 18 1.44772 18 2V9M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18M6 14H18V22C18 22.5523 17.5523 23 17 23H7C6.44772 23 6 22.5523 6 22V14Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    save: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16L21 8V19C21 20.1046 20.1046 21 19 21Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 21V13H7V21" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 3V8H15" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Navigation
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 9L12 15L18 9" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    chevronRight: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 18L15 12L9 6" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Notifications
    bell: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // User and Profile
    user: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Home and Dashboard
    home: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 22V12H15V22" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Settings and Configuration
    settings: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.2582 9.77251 19.9887C9.5799 19.7193 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.74178 9.96512 4.01118 9.77251C4.28058 9.5799 4.48571 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Add/Plus
    plus: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 5V19M5 12H19" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Edit
    edit: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Information
    info: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
      <path d="M12 16V12M12 8H12.01" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Success/Check
    check: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 6L9 17L4 12" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Error/X
    x: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 6L6 18M6 6L18 18" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Search
    search: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="8" stroke="${color}" stroke-width="2"/>
      <path d="M21 21L16.65 16.65" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Download
    download: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M7 10L12 15L17 10M12 15V3" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Upload
    upload: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3L7 8M12 3V15" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Dashboard/Grid
    grid: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="14" y="3" width="7" height="7" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="14" y="14" width="7" height="7" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="3" y="14" width="7" height="7" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Menu/Hamburger
    menu: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 12H21M3 6H21M3 18H21" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Lock
    lock: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="${color}" stroke-width="2"/>
      <circle cx="12" cy="16" r="1" fill="${color}"/>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="${color}" stroke-width="2"/>
    </svg>`,
    
    // Unlock
    unlock: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="${color}" stroke-width="2"/>
      <circle cx="12" cy="16" r="1" fill="${color}"/>
      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7" stroke="${color}" stroke-width="2"/>
    </svg>`,
    
    // Eye/View
    eye: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke="${color}" stroke-width="2"/>
    </svg>`,
    
    // Eye Off/Hide
    eyeOff: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 4.028 7.68102 6.18 6.18M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4283 14.7056 10.0887 14.481 9.80385 14.1962C9.51900 13.9113 9.29439 13.5717 9.14351 13.1984C8.99262 12.8251 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88M1 1L23 23" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Refresh/Reload
    refresh: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 4V10H17M1 20V14H7M20.49 9C20.0295 7.26234 19.0955 5.68593 17.8109 4.46826C16.5263 3.25059 14.9499 2.44693 13.2501 2.14479C11.5503 1.84265 9.80532 2.05477 8.22032 2.75317C6.63533 3.45157 5.27886 4.60536 4.32 6.07M3.51 15C3.97049 16.7377 4.90447 18.3141 6.18906 19.5317C7.47366 20.7494 9.05009 21.5531 10.7499 21.8552C12.4497 22.1574 14.1947 21.9452 15.7797 21.2468C17.3647 20.5484 18.7211 19.3946 19.68 17.93" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Copy
    copy: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="${color}" stroke-width="2"/>
      <path d="M5 15H4C3.46957 15 2.96086 14.7893 2.58579 14.4142C2.21071 14.0391 2 13.5304 2 13V4C2 3.46957 2.21071 2.96086 2.58579 2.58579C2.96086 2.21071 3.46957 2 4 2H13C13.5304 2 14.0391 2.21071 14.4142 2.58579C14.7893 2.96086 15 3.46957 15 4V5" stroke="${color}" stroke-width="2"/>
    </svg>`,
    
    // External Link
    external: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 3H21V10" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M10 14L21 3" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M21 14V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H10" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // WiFi/Network
    wifi: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.42 9C3.28 6.8 5.98 5.45 8.95 5.05C11.92 4.65 14.95 5.21 17.58 6.65C18.85 7.35 20 8.25 21 9.35M5 13C6.24 11.61 7.97 10.68 9.86 10.39C11.75 10.1 13.68 10.46 15.36 11.42C16.2 11.9 16.97 12.53 17.64 13.29M8.53 16.11C9.37 15.66 10.32 15.42 11.28 15.42C12.24 15.42 13.19 15.66 14.03 16.11M12 20L12.01 19.99" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    
    // Rotate Counter-Clockwise/Reset
    'rotate-ccw': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 4V10H7M23 20V14H17M20.49 9C19.05 5.81 15.92 3.69 12.34 3.69C9.77 3.69 7.39 4.87 5.75 6.75L1 10M23 14L18.25 17.25C16.61 19.13 14.23 20.31 11.66 20.31C8.08 20.31 4.95 18.19 3.51 15" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`
  };

  $: iconSvg = icons[name as keyof typeof icons] || '';
</script>

<span class="icon {className}" style="width: {size}px; height: {size}px; display: inline-block;">
  {@html iconSvg}
</span>

<style>
  .icon {
    vertical-align: middle;
    flex-shrink: 0;
  }
  
  .icon :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
