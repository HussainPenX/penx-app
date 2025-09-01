// Responsive styles utility
const getResponsiveStyles = () => {
  // Safely get window dimensions
  const getWindowDimensions = () => {
    try {
      return {
        width: window.innerWidth || document.documentElement.clientWidth || 1024,
        height: window.innerHeight || document.documentElement.clientHeight || 768
      };
    } catch (error) {
      // Fallback dimensions if window access is blocked
      return { width: 1024, height: 768 };
    }
  };

  const { width, height } = getWindowDimensions();

  // Breakpoints based on common device sizes
  const breakpoints = {
    // Phone breakpoints
    small: 480,    // Small phones
    medium: 768,   // Large phones / Small tablets
    // Tablet breakpoints
    tablet: 1024,  // Tablets
    // Laptop breakpoints
    laptop: 1366,  // Small laptops
    desktop: 1920, // Full HD and above
  };

  // Font sizes that scale with viewport
  const fontSize = {
    xs: width < breakpoints.small ? '0.75rem' : '0.875rem',
    sm: width < breakpoints.small ? '0.875rem' : '1rem',
    base: width < breakpoints.small ? '1rem' : '1.125rem',
    lg: width < breakpoints.small ? '1.125rem' : '1.25rem',
    xl: width < breakpoints.small ? '1.25rem' : '1.5rem',
    '2xl': width < breakpoints.small ? '1.5rem' : '2rem',
    '3xl': width < breakpoints.small ? '2rem' : '2.5rem',
  };

  // Spacing that scales with viewport
  const spacing = {
    xs: width < breakpoints.small ? '0.5rem' : '0.75rem',
    sm: width < breakpoints.small ? '0.75rem' : '1rem',
    base: width < breakpoints.small ? '1rem' : '1.5rem',
    md: width < breakpoints.small ? '1.25rem' : '2rem',
    lg: width < breakpoints.small ? '1.5rem' : '2.5rem',
    xl: width < breakpoints.small ? '2rem' : '3rem',
    '2xl': width < breakpoints.small ? '3rem' : '4rem',
  };

  // Container widths based on device size
  const containerWidth = {
    sm: '100%', // Full width on mobile
    md: width < breakpoints.tablet ? '100%' : '720px',
    lg: width < breakpoints.laptop ? '100%' : '960px',
    xl: width < breakpoints.desktop ? '1200px' : '1400px',
  };

  // Image sizes that scale with viewport
  const imageSize = {
    sm: width < breakpoints.small ? '100px' : '150px',
    md: width < breakpoints.small ? '150px' : '200px',
    lg: width < breakpoints.small ? '200px' : '300px',
  };

  // Profile picture sizes
  const profilePictureSize = {
    sm: width < breakpoints.small ? '80px' : '100px',
    md: width < breakpoints.small ? '100px' : '150px',
    lg: width < breakpoints.small ? '150px' : '200px',
  };

  // Book card dimensions
  const bookCard = {
    width: width < breakpoints.small ? '140px' : 
           width < breakpoints.medium ? '160px' : 
           width < breakpoints.tablet ? '180px' : '200px',
    height: width < breakpoints.small ? '280px' : 
            width < breakpoints.medium ? '320px' : 
            width < breakpoints.tablet ? '360px' : '400px',
    imageHeight: width < breakpoints.small ? '180px' : 
                 width < breakpoints.medium ? '200px' : 
                 width < breakpoints.tablet ? '220px' : '240px',
  };

  // Button sizes
  const buttonSize = {
    sm: {
      padding: width < breakpoints.small ? '0.5rem 1rem' : '0.75rem 1.5rem',
      fontSize: width < breakpoints.small ? '0.875rem' : '1rem',
    },
    md: {
      padding: width < breakpoints.small ? '0.75rem 1.5rem' : '1rem 2rem',
      fontSize: width < breakpoints.small ? '1rem' : '1.125rem',
    },
    lg: {
      padding: width < breakpoints.small ? '1rem 2rem' : '1.25rem 2.5rem',
      fontSize: width < breakpoints.small ? '1.125rem' : '1.25rem',
    },
  };

  // Grid layout
  const grid = {
    columns: width < breakpoints.small ? 1 : 
             width < breakpoints.medium ? 2 : 
             width < breakpoints.tablet ? 3 : 
             width < breakpoints.laptop ? 4 : 5,
    gap: width < breakpoints.small ? '1rem' : 
         width < breakpoints.medium ? '1.5rem' : '2rem',
  };

  // Header sizes
  const header = {
    height: width < breakpoints.small ? '60px' : 
            width < breakpoints.medium ? '70px' : '80px',
    logoSize: width < breakpoints.small ? '40px' : 
              width < breakpoints.medium ? '50px' : '60px',
  };

  // Footer sizes
  const footer = {
    height: width < breakpoints.small ? '60px' : 
            width < breakpoints.medium ? '70px' : '80px',
  };

  // Navigation
  const navigation = {
    itemSpacing: width < breakpoints.small ? '1rem' : 
                 width < breakpoints.medium ? '1.5rem' : '2rem',
    fontSize: width < breakpoints.small ? '0.875rem' : 
              width < breakpoints.medium ? '1rem' : '1.125rem',
  };

  // Search bar
  const searchBar = {
    height: width < breakpoints.small ? '36px' : 
            width < breakpoints.medium ? '40px' : '44px',
    fontSize: width < breakpoints.small ? '0.875rem' : 
              width < breakpoints.medium ? '1rem' : '1.125rem',
    padding: width < breakpoints.small ? '0.5rem 1rem' : 
             width < breakpoints.medium ? '0.75rem 1.25rem' : '1rem 1.5rem',
  };

  // Card styles
  const card = {
    padding: width < breakpoints.small ? '1rem' : 
             width < breakpoints.medium ? '1.25rem' : '1.5rem',
    borderRadius: width < breakpoints.small ? '0.5rem' : 
                  width < breakpoints.medium ? '0.75rem' : '1rem',
  };

  return {
    width,
    height,
    breakpoints,
    fontSize,
    spacing,
    containerWidth,
    imageSize,
    profilePictureSize,
    bookCard,
    buttonSize,
    grid,
    header,
    footer,
    navigation,
    searchBar,
    card,
  };
};

export default getResponsiveStyles; 