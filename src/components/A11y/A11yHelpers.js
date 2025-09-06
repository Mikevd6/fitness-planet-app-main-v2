/**
 * Helper functies voor toegankelijkheid
 */

/**
 * Genereert de juiste aria-eigenschappen voor een sorteerbaar tabelkopje
 * @param {string} currentSortColumn - De huidige kolom waarop wordt gesorteerd
 * @param {string} column - De kolom waarvoor de eigenschappen worden gegenereerd
 * @param {string} direction - De huidige sorteerrichting ('asc' of 'desc')
 * @returns {Object} Aria-eigenschappen voor het tabelkopje
 */
export const getSortableColumnProps = (currentSortColumn, column, direction) => {
  const isSorted = currentSortColumn === column;
  
  return {
    'aria-sort': isSorted 
      ? (direction === 'asc' ? 'ascending' : 'descending') 
      : 'none',
    'aria-label': `Sorteer op ${column}${isSorted ? ` (nu ${direction === 'asc' ? 'oplopend' : 'aflopend'} gesorteerd)` : ''}`,
    role: 'columnheader',
    tabIndex: 0,
    'data-column': column,
    className: `sortable-column ${isSorted ? 'sorted' : ''} ${isSorted && direction ? direction : ''}`,
  };
};

/**
 * Genereert aria-eigenschappen voor een uitklapbaar element
 * @param {string} id - Unieke ID voor het element
 * @param {boolean} isExpanded - Of het element is uitgeklapt
 * @returns {Object} Aria-eigenschappen
 */
export const getExpandableProps = (id, isExpanded) => {
  return {
    button: {
      'aria-expanded': isExpanded,
      'aria-controls': `content-${id}`,
      id: `button-${id}`,
    },
    content: {
      id: `content-${id}`,
      role: 'region',
      'aria-labelledby': `button-${id}`,
      hidden: !isExpanded,
    }
  };
};

/**
 * Verbeter de toegankelijkheid van afbeeldingen
 * @param {string} src - Bron van de afbeelding
 * @param {string} alt - Alt-tekst
 * @param {string} [longDesc] - Optionele uitgebreide beschrijving voor complexe afbeeldingen
 * @returns {Object} Props voor een toegankelijke afbeelding
 */
export const getAccessibleImageProps = (src, alt, longDesc) => {
  const props = {
    src,
    alt,
    loading: 'lazy'
  };
  
  if (alt === '') {
    props.role = 'presentation';
    props['aria-hidden'] = true;
  }
  
  if (longDesc) {
    props['aria-describedby'] = `desc-${src.split('/').pop().split('.')[0]}`;
  }
  
  return props;
};