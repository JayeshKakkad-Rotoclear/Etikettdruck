<script lang="ts">
  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { notificationStore } from '$lib';
  import { getPrinterIp } from '$lib/printer.js';

  // Scanning mode variables
  let scannedQRs: string[] = [];
  let scanInput = '';
  
  // Manual selection mode variables
  let manualMode = false;
  let availableProducts: any[] = [];
  let availableZubehoer: any[] = [];
  let manualSelections: Record<string, { selected: boolean; serialNumber: string; etikettId: string }> = {};
  let expandedManualEntries: any[] = [];
  let isExpandingZubehoer = false;
  
  // Collapsible categories state
  let expandedCategories: Record<string, boolean> = {
    cpro: false,
    c2: false,
    cbasic: false,
    kk: false,
    zubehoer: false
  };
  
  // Common variables
  let lieferscheinNumber = '';  // New field for Lieferschein number
  let finalGroupedEntries: any[] = [];  // Combined entries for display and submission
  let scannedEntries: any[] = [];  // Cached scanned entries with lookups
  let error: string | null = null;
  let submitSuccess = false;

  onMount(async () => {
    await loadAvailableProducts();
    await loadAvailableZubehoer();
  });

  async function loadAvailableProducts() {
    try {
      // Load from all product APIs
      const responses = await Promise.all([
        fetch('/api/cpro'),
        fetch('/api/c2'),
        fetch('/api/cbasic'),
        fetch('/api/kk')
      ]);

      const data = await Promise.all(responses.map(r => r.json()));
      
      availableProducts = [
        ...data[0].success ? data[0].items.map((item: any) => ({ ...item, type: 'cpro' })) : [],
        ...data[1].success ? data[1].items.map((item: any) => ({ ...item, type: 'c2' })) : [],
        ...data[2].success ? data[2].items.map((item: any) => ({ ...item, type: 'cbasic' })) : [],
        ...data[3].success ? data[3].items.map((item: any) => ({ ...item, type: 'kk' })) : []
      ];

      // Initialize manual selections
      availableProducts.forEach(product => {
        const key = `${product.type}_${product.serialnummer}`;
        manualSelections[key] = { selected: false, serialNumber: product.serialnummer, etikettId: '' };
      });
    } catch (err) {
      notificationStore.error('Fehler beim Laden', 'Fehler beim Laden der verfügbaren Produkte.');
    }
  }

  async function loadAvailableZubehoer() {
    try {
      const response = await fetch('/api/zubehoer');
      const data = await response.json();
      
      if (data.success) {
        availableZubehoer = data.items.map((item: any) => ({ ...item, type: 'zubehoer' }));
        
        // Initialize manual selections for Zubehör
        availableZubehoer.forEach(zubehoer => {
          const key = `zubehoer_${zubehoer.id}`;
          manualSelections[key] = { selected: false, serialNumber: '', etikettId: zubehoer.id.toString() };
        });
      }
    } catch (err) {
      notificationStore.error('Fehler beim Laden', 'Fehler beim Laden des verfügbaren Zubehörs.');
    }
  }

  function handleScanInput() {
    const value = scanInput.trim();
    if (value && !scannedQRs.includes(value)) {
      scannedQRs = [...scannedQRs, value];
      // Trigger lookup for any new entries that need it
      setTimeout(async () => {
        await updateScannedEntries();
      }, 100);
    }
    scanInput = '';
  }

  // Function to update scanned entries with lookup data
  async function updateScannedEntries() {
    const parsedEntries = scannedQRs.flatMap((qr) => parseQRContent(qr));
    const updatedEntries = [];
    
    for (const entry of parsedEntries) {
      if (entry.needsLookup && entry.serialnummer && !entry.artikelnummer) {
        try {
          const productData = await lookupProductBySerial(entry.serialnummer);
          if (productData && productData.artikel_nummer) {
            entry.artikelnummer = productData.artikel_nummer;
            entry.needsLookup = false;
          }
        } catch (err) {
          console.error(`Error looking up serial ${entry.serialnummer}:`, err);
        }
      } else if (entry.needsLookup && entry.lieferscheinNummer && entry.artikelnummer === 'ZUBEHOER_LOOKUP') {
        // Handle Zubehör lookup by Lieferschein number
        try {
          const zubehoerEntries = await lookupZubehoerByLieferschein(entry.lieferscheinNummer);
          if (zubehoerEntries && zubehoerEntries.length > 0) {
            // Replace the lookup entry with the actual Zubehör entries
            updatedEntries.push(...zubehoerEntries);
            continue; // Skip adding the original entry
          } else {
            // If lookup failed, keep the entry but mark it
            entry.artikelbezeichnung = `Zubehör (Lieferschein: ${entry.lieferscheinNummer}) - Lookup Failed`;
            entry.needsLookup = false;
          }
        } catch (err) {
          console.error(`Error looking up Zubehör Lieferschein ${entry.lieferscheinNummer}:`, err);
          entry.artikelbezeichnung = `Zubehör (Lieferschein: ${entry.lieferscheinNummer}) - Lookup Error`;
          entry.needsLookup = false;
        }
      }
      updatedEntries.push(entry);
    }
    
    // Force reactivity update
    scannedEntries = updatedEntries;
  }

  function parseQRContent(qr: string): any[] {
    const lines = qr.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    
    // Check if this is a Zubehör QR code
    if (qr.includes('ZUBEHOER:') || lines.some(line => line.startsWith('ZUBEHOER:'))) {
      // Extract Lieferschein number for potential lookup
      let lieferscheinNummer = '';
      const lieferscheinMatch = qr.match(/ZUBEHOER:\s*(\d+)/);
      if (lieferscheinMatch) {
        lieferscheinNummer = lieferscheinMatch[1].trim();
      }
      
      // Try to parse the complete QR data first (original multi-line format)
      if (lines.length > 1) {
        const entries = [];
        
        for (const line of lines) {
          // Skip the ZUBEHOER header line
          if (line.startsWith('ZUBEHOER:')) continue;
          
          // Parse lines in format: "artikelnummer - artikelbezeichnung - menge"
          const productMatch = line.match(/^(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(\d+)$/);
          if (productMatch) {
            const [, artikelnummer, artikelbezeichnung, menge] = productMatch;
            entries.push({
              artikelnummer: artikelnummer.trim(),
              artikelbezeichnung: artikelbezeichnung.trim(),
              serialnummer: null,
              menge: parseInt(menge),
              needsLookup: false
            });
          }
        }
        
        if (entries.length > 0) {
          return entries;
        }
      }
      
      // Fallback: Use lookup approach if parsing fails or data is corrupted
      if (lieferscheinNummer) {
        return [{
          artikelnummer: 'ZUBEHOER_LOOKUP',
          artikelbezeichnung: `Zubehör (Lieferschein: ${lieferscheinNummer})`,
          serialnummer: null,
          menge: 1,
          needsLookup: true,
          lieferscheinNummer: lieferscheinNummer
        }];
      }
      
      // Final fallback
      return [{ 
        artikelnummer: 'UNKNOWN', 
        artikelbezeichnung: 'Zubehör Etikett (Parsing Error)', 
        serialnummer: null, 
        menge: 1 
      }];
    }
    
    // Check if this is a simple Zubehör QR code (just ZUBEHOER:number) - for backward compatibility
    const simpleZubehoerMatch = qr.match(/^ZUBEHOER:(\d+)$/);
    if (simpleZubehoerMatch) {
      const lieferscheinNummer = simpleZubehoerMatch[1];
      return [{
        artikelnummer: 'ZUBEHOER_LOOKUP',
        artikelbezeichnung: `Zubehör (Lieferschein: ${lieferscheinNummer})`,
        serialnummer: null,
        menge: 1,
        needsLookup: true,
        lieferscheinNummer: lieferscheinNummer
      }];
    }
    
    // Check if this is a Zubehör QR code (new compact format with pipes)
    if (qr.includes('ZUBEHOER:') && qr.includes('||')) {
      const zubehoerMatch = qr.match(/ZUBEHOER:(\d+)/);

      
      // Split by double pipes to get individual items
      const parts = qr.split('||').filter(part => part.trim().length > 0);
      
      const entries = [];
      
      for (let i = 0; i < parts.length; i++) {
        let part = parts[i].trim();
        
        part = part.replace(/^ZUBEHOER:\d+\|/, '');
        
        if (!part || part.startsWith('ZUBEHOER:')) {
          continue;
        }
        
        
        if (part.includes('SN:') && part.includes('ART:') && part.includes('ARTN:')) {
          const entry: any = {
            artikelnummer: '',
            artikelbezeichnung: '',
            serialnummer: null,
            menge: 1,
            needsLookup: false
          };

          const fields = part.split('|');
          
          for (const field of fields) {
            if (field.startsWith('SN:')) {
              const sn = field.replace('SN:', '').trim();
              if (sn !== 'N/A') {
                entry.serialnummer = sn;
              }
            } else if (field.startsWith('ART:')) {
              entry.artikelbezeichnung = field.replace('ART:', '').trim();
            } else if (field.startsWith('ARTN:')) {
              entry.artikelnummer = field.replace('ARTN:', '').trim();
            } else if (field.startsWith('MENGE:')) {
              entry.menge = parseInt(field.replace('MENGE:', '').trim()) || 1;
            }
          }
          
          if (entry.artikelnummer && entry.artikelbezeichnung) {
            entries.push(entry);
          }
        }
      }
      
      if (entries.length > 0) {
        return entries;
      }
    }
    
    const zubehoerLine = lines.find(line => line.startsWith('ZUBEHOER:'));
    if (zubehoerLine || qr.includes('ZUBEHOER:')) {
      
      let qrText = qr;
      
      if (lines.length === 1 && qr.includes('ZUBEHOER:')) {
        
        const zubehoerMatch = qr.match(/ZUBEHOER:\s*(\d+)/);
        
        const parts = qr.split(/(?=SN:)/).filter(part => part.trim().length > 0);
        
        const entries = [];
        
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i].trim();
          
          if (part.startsWith('ZUBEHOER:') && !part.includes('SN:')) {
            continue;
          }
          
          // Remove ZUBEHOER prefix if it exists in this part
          let cleanPart = part.replace(/^ZUBEHOER:\s*\d+\s*/, '');
          
          // Parse this part if it contains the required fields
          if (cleanPart.includes('SN:') && cleanPart.includes('ART:') && cleanPart.includes('ARTN:')) {
            
            const entry: any = {
              artikelnummer: '',
              artikelbezeichnung: '',
              serialnummer: null,
              menge: 1,
              needsLookup: false
            };

            // Parse the compact QR format
            const snMatch = cleanPart.match(/SN:\s*([^\s]+)/);
            const artMatch = cleanPart.match(/ART:\s*(.*?)\s+ARTN:/);
            const artnMatch = cleanPart.match(/ARTN:\s*([^\s]+)/);
            const mengeMatch = cleanPart.match(/MENGE:\s*(\d+)/);

            if (snMatch && snMatch[1] !== 'N/A') {
              entry.serialnummer = snMatch[1].trim();
            }
            if (artMatch) {
              entry.artikelbezeichnung = artMatch[1].trim();
            }
            if (artnMatch) {
              entry.artikelnummer = artnMatch[1].trim();
            }
            if (mengeMatch) {
              entry.menge = parseInt(mengeMatch[1]);
            }

            entries.push(entry);
          } else {
          }
        }
        
        if (entries.length > 0) {
          return entries;
        }
      } else {
        
        const entries = [];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Skip the header line
          if (line.startsWith('ZUBEHOER:')) {
            continue;
          }
          
          // Parse each line in the standard format: SN: xxx ART: yyy ARTN: zzz MENGE: nnn
          if (line.includes('SN: ') && line.includes('ART: ') && line.includes('ARTN: ')) {
            
            const entry: any = {
              artikelnummer: '',
              artikelbezeichnung: '',
              serialnummer: null,
              menge: 1,
              needsLookup: false
            };

            // Parse the compact QR format with more precise regex
            const snMatch = line.match(/SN:\s*([^\s]+)/);
            // More robust regex for artikelbezeichnung - capture everything between ART: and ARTN:
            const artMatch = line.match(/ART:\s*(.*?)\s+ARTN:/);
            const artnMatch = line.match(/ARTN:\s*([^\s]+)/);
            const mengeMatch = line.match(/MENGE:\s*(\d+)/);

            if (snMatch && snMatch[1] !== 'N/A') {
              entry.serialnummer = snMatch[1].trim();
            }
            if (artMatch) {
              entry.artikelbezeichnung = artMatch[1].trim();
            }
            if (artnMatch) {
              entry.artikelnummer = artnMatch[1].trim();
            }
            if (mengeMatch) {
              entry.menge = parseInt(mengeMatch[1]);
            }
            entries.push(entry);
          } else {
          }
        }
        
        if (entries.length > 0) {
          return entries;
        }
      }
    }
    
    // Check if this is an old format Zubehör QR code
    const lieferscheinLine = lines.find(line => line.startsWith('Lieferschein:'));
    if (lieferscheinLine) {
      
      // Extract Lieferschein number for lookup
      const lieferscheinMatch = qr.match(/Lieferschein:\s*(\d+)/);
      if (lieferscheinMatch) {
        const lieferscheinNummer = lieferscheinMatch[1].trim();
        return [{
          artikelnummer: 'ZUBEHOER_LOOKUP',
          artikelbezeichnung: `Zubehör (Lieferschein: ${lieferscheinNummer})`,
          serialnummer: null,
          menge: 1,
          needsLookup: true,
          lieferscheinNummer: lieferscheinNummer
        }];
      }
      
      return [{ 
        artikelnummer: 'UNKNOWN', 
        artikelbezeichnung: 'Zubehör Etikett (Parsing Error)', 
        serialnummer: null, 
        menge: 1 
      }];
    }

    // Check if this is a Halterung QR code
    // Two formats:
    // 1. Single item: ART: [description] ARTN: [number] MENGE: [qty] DAT: [date]
    // 2. Multiple items: HALTERUNG: [date] \n [artikelnummer] - [description] - [menge] \n ...
    if (qr.includes('HALTERUNG: ')) {
      // Support two multi-item styles:
      // A) New compact: HALTERUNG: <datum> || ART:<nr>|BEZ:<bez>|M:<qty> || ART:...
      // B) Legacy dashed (all in one line or newline separated): HALTERUNG: <datum> <nr> - <bez> - <qty> <nr> - <bez> - <qty>
      const entries: any[] = [];
      const compact = qr.includes('||') && qr.includes('ART:') && qr.includes('|BEZ:');

      if (compact) {
        // Extract segments after first '||'
        const segments = qr.split('||').map(s => s.trim()).filter(s => s.startsWith('ART:'));
        for (const seg of segments) {
          // seg example: ART:10144|BEZ:Flex-Armhalter (Blecheinbau)-HALTERUNG|M:1
          const artMatch = seg.match(/ART:([^|]+)/);
          const bezMatch = seg.match(/\|BEZ:([^|]+)(?=\|M:|$)/);
          const mengeMatch = seg.match(/\|M:(\d+)/);
          const artikelnummer = artMatch?.[1]?.trim();
          const artikelbezeichnung = bezMatch?.[1]?.replace(/-HALTERUNG/g,'').trim();
          const menge = mengeMatch ? parseInt(mengeMatch[1]) : NaN;
          if (artikelnummer && artikelbezeichnung && !isNaN(menge)) {
            entries.push({ artikelnummer, artikelbezeichnung, menge, serialnummer: null, needsLookup: false });
          }
        }
      } else {
        // Legacy form: try to isolate repeating pattern <nr> - <text> - <qty>
        // Remove leading header 'HALTERUNG: date'
        const body = qr.replace(/^[^\d]*\d{2}-\d{2}-\d{4}\s*/,'');
        // Pattern: number - description - qty (qty is last integer after dash)
        // We'll split by occurrences of a number followed by ' - '
        const tokenRegex = /(\d{4,})\s*-\s*([^\-]+?)\s*-\s*(\d+)(?=\s+\d{4,}\s*-|$)/g;
        let m: RegExpExecArray | null;
        while ((m = tokenRegex.exec(body)) !== null) {
          const artikelnummer = m[1].trim();
          const artikelbezeichnung = m[2].trim();
          const menge = parseInt(m[3]);
          if (artikelnummer && artikelbezeichnung && !isNaN(menge)) {
            entries.push({ artikelnummer, artikelbezeichnung, menge, serialnummer: null, needsLookup: false });
          }
        }
      }

      if (entries.length > 0) return entries;
      return [{ artikelnummer:'HALTERUNG_MULTI_UNKNOWN', artikelbezeichnung:'Halterung Multi-Etikett (Parsing Error)', serialnummer:null, menge:1 }];
    } else if (qr.includes('ART: ') && qr.includes('ARTN: ') && qr.includes('DAT: ') && 
        qr.includes('MENGE: ') && !qr.includes('SN: ') && !qr.includes('ZUBEHOER:') && !qr.includes('HALTERUNG:')) {
      // Single item format: ART: [description] ARTN: [number] MENGE: [qty] DAT: [date]
      const entries = [];
      
      // Handle both single-line and multi-line formats
      // For single item (your case): ART: item ARTN: number MENGE: qty DAT: date
      // For multiple items: ART: item1 ART: item2 ARTN: num1 ARTN: num2 MENGE: qty1 MENGE: qty2 DAT: date
      
      // Extract all occurrences of each field
      const artMatches = qr.match(/ART:\s*([^A\n\r]*?)(?=\s+(?:ART|ARTN):|$)/g);
      const artnMatches = qr.match(/ARTN:\s*([^\s\n\r]+)/g);
      const mengeMatches = qr.match(/MENGE:\s*(\d+)/g);
      
      if (artMatches && artnMatches && mengeMatches && 
          artMatches.length === artnMatches.length && artnMatches.length === mengeMatches.length) {
        for (let i = 0; i < artMatches.length; i++) {
          // Clean extract the content
          const artContent = artMatches[i].replace(/ART:\s*/, '').trim();
          const artnContent = artnMatches[i].replace(/ARTN:\s*/, '').trim();
          const mengeContent = parseInt(mengeMatches[i].replace(/MENGE:\s*/, '').trim());
          
          if (artContent && artnContent && !isNaN(mengeContent)) {
            entries.push({
              artikelnummer: artnContent,
              artikelbezeichnung: artContent,
              serialnummer: null, // Halterung has no serial numbers
              menge: mengeContent,
              needsLookup: false
            });
          }
        }
      } else {
        // Fallback for single item case - simpler parsing
        const artMatch = qr.match(/ART:\s*(.+?)(?=\s+ARTN:)/);
        const artnMatch = qr.match(/ARTN:\s*(.+?)(?=\s+MENGE:)/);
        const mengeMatch = qr.match(/MENGE:\s*(\d+)/);
        
        if (artMatch && artnMatch && mengeMatch) {
          const artikelbezeichnung = artMatch[1].trim();
          const artikelnummer = artnMatch[1].trim();
          const menge = parseInt(mengeMatch[1]);
          
          if (artikelbezeichnung && artikelnummer && !isNaN(menge)) {
            entries.push({
              artikelnummer: artikelnummer,
              artikelbezeichnung: artikelbezeichnung,
              serialnummer: null, // Halterung has no serial numbers
              menge: menge,
              needsLookup: false
            });
          }
        }
      }
      
      if (entries.length > 0) {
        return entries;
      }
      
      // Fallback for malformed halterung QR
      return [{ 
        artikelnummer: 'HALTERUNG_UNKNOWN', 
        artikelbezeichnung: 'Halterung Etikett (Parsing Error)', 
        serialnummer: null, 
        menge: 1 
      }];
    } else {
      // Check if this is a new format QR code (single line with space-separated key:value pairs)
      const qrText = qr.trim();
      
      // New format: "SN: xxx ART: yyy ELE: zzz ..." (single line with key:value pairs)
      if (qrText.includes('SN: ') && qrText.includes('ART: ')) {
        const entry: any = {
          artikelnummer: '',
          artikelbezeichnung: '',
          serialnummer: '',
          menge: 1,
          needsLookup: false // Will be set to true only if artikel_nummer is missing
        };

        // Parse the compact QR format
        const snMatch = qrText.match(/SN:\s*([^\s]+)/);
        // More robust regex for artikelbezeichnung - capture everything until the next field
        const artMatch = qrText.match(/ART:\s*(.*?)(?=\s+[A-Z]{2,}:|$)/);

        const artnMatch = qrText.match(/ARTN:\s*([^\s]+)/);

        if (snMatch) {
          entry.serialnummer = snMatch[1].trim();
        }
        if (artMatch) {
          entry.artikelbezeichnung = artMatch[1].trim();
        }
        if (artnMatch) {
          entry.artikelnummer = artnMatch[1].trim();
        } else {
          // Only set needsLookup if artikel_nummer is not found in QR
          entry.needsLookup = true;
        }

        return [entry];
      }
      
      // Legacy format - multiline with key: value
      const entry: any = {
        artikelnummer: '',
        artikelbezeichnung: '',
        serialnummer: '',
        menge: 1
      };

      for (const line of lines) {
        if (line.startsWith('Artikelnummer:')) {
          entry.artikelnummer = line.replace('Artikelnummer:', '').trim();
        } else if (line.startsWith('Artikelbezeichnung:')) {
          entry.artikelbezeichnung = line.replace('Artikelbezeichnung:', '').trim();
        } else if (line.startsWith('Seriennummer:')) {
          entry.serialnummer = line.replace('Seriennummer:', '').trim();
        } else {
          // fallback format: artikelnummer bezeichnung - menge
          const fallbackMatch = line.match(/^(.*?)\s+-\s+(\d+)$/);
          if (fallbackMatch) {
            entry.artikelnummer = fallbackMatch[1];
            entry.menge = parseInt(fallbackMatch[2]);
          }
        }
      }

      return [entry];
    }
  }

  async function lookupProductBySerial(serialnummer: string): Promise<{artikel_nummer: string, type: string} | null> {
    try {
      // Try each product type API endpoint to find the product
      const endpoints = [
        { api: '/api/cpro', type: 'cpro' },
        { api: '/api/c2', type: 'c2' },
        { api: '/api/cbasic', type: 'cbasic' },
        { api: '/api/kk', type: 'kk' }
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(`${endpoint.api}?serialnummer=${encodeURIComponent(serialnummer)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.found && data.item && data.item.artikel_nummer) {
              return {
                artikel_nummer: data.item.artikel_nummer,
                type: endpoint.type
              };
            }
          }
        } catch (err) {
          console.warn(`Failed to lookup in ${endpoint.api}:`, err);
          continue;
        }
      }
      return null;
    } catch (err) {
      console.error('Error looking up product by serial:', err);
      return null;
    }
  }

  async function lookupZubehoerByLieferschein(lieferscheinNummer: string): Promise<any[] | null> {
    try {
      const response = await fetch(`/api/zubehoer?lieferscheinnummer=${encodeURIComponent(lieferscheinNummer)}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.found && data.item) {
          // Return the entries from the found Zubehör
          const zubehoerItem = data.item;
          if (zubehoerItem.entries) {
            const entries = zubehoerItem.entries.map((entry: any) => ({
              artikelnummer: entry.artikelnummer,
              artikelbezeichnung: entry.artikelbezeichnung,
              serialnummer: entry.serialnummer || null,
              menge: entry.menge || 1,
              needsLookup: false
            }));
            return entries;
          }
        }
      }
      return null;
    } catch (err) {
      console.error('Error looking up Zubehör by Lieferschein:', err);
      return null;
    }
  }

  async function expandZubehoerToIndividualProducts(zubehoerId: string): Promise<any[]> {
    try {
      const response = await fetch(`/api/zubehoer/${zubehoerId}`);
      const data = await response.json();
      
      if (data.success && data.item && data.item.entries) {
        // data.item.entries should be the JSON array of individual products
        return data.item.entries.map((entry: any) => ({
          artikelnummer: entry.artikelnummer,
          artikelbezeichnung: entry.artikelbezeichnung,
          serialnummer: null, // Zubehör products don't have individual serial numbers
          menge: entry.menge || 1
        }));
      }
      
      return [];
    } catch (err) {
      notificationStore.error('Zubehör Fehler', 'Fehler beim Erweitern der Zubehör-Produkte.');
      return [];
    }
  }

  // Function to update manual entries when selections change
  async function updateManualEntries() {
    if (isExpandingZubehoer || !manualMode) return; // Prevent concurrent updates
    
    isExpandingZubehoer = true;
    
    try {
      const selectedEntries = Object.entries(manualSelections)
        .filter(([_, selection]) => selection.selected);

      const results = await Promise.all(
        selectedEntries.map(async ([key, selection]) => {
          if (key.startsWith('zubehoer_')) {
            return await expandZubehoerToIndividualProducts(selection.etikettId);
          } else {
            // Regular product
            const product = availableProducts.find(p => 
              `${p.type}_${p.serialnummer}` === key
            );
            return [{
              artikelnummer: product?.artikel_nummer || '',
              artikelbezeichnung: product?.artikel_bezeichnung || '',
              serialnummer: selection.serialNumber,
              menge: 1
            }];
          }
        })
      );

      expandedManualEntries = results.flat();
    } catch (err) {
      notificationStore.error('Manuelle Einträge Fehler', 'Fehler beim Aktualisieren der manuellen Einträge.');
      expandedManualEntries = [];
    } finally {
      isExpandingZubehoer = false;
    }
  }

  // Function to handle checkbox changes
  function handleManualSelection() {
    if (!manualMode) return;
    
    // Use setTimeout to handle async update outside reactive context
    setTimeout(() => {
      updateManualEntries();
    }, 0);
  }

  // Handle mode switching
  function switchMode() {
    manualMode = !manualMode;
    error = null;
    submitSuccess = false;
    
    if (manualMode) {
      // When switching to manual mode, update entries immediately
      setTimeout(() => {
        updateManualEntries();
      }, 0);
    }
  }

  // Reactive statement to trigger lookup when scannedQRs changes
  $: if (scannedQRs.length > 0 && !manualMode) {
    updateScannedEntries();
  }

  // Use expanded entries when in manual mode
  $: {
    finalGroupedEntries = manualMode ? expandedManualEntries : scannedEntries.length > 0 ? scannedEntries : scannedQRs.flatMap((qr) => parseQRContent(qr));
  }

  async function submitOuterKarton() {
    try {
      if (!finalGroupedEntries || finalGroupedEntries.length === 0) {
        notificationStore.error('Validierung fehlgeschlagen', 'Keine Einträge zum Speichern vorhanden.');
        return;
      }
      
      // Process entries and lookup missing artikel_nummer when needed
      const enriched = [];
      
      for (const e of finalGroupedEntries) {
        let entry = {
          artikelnummer: e.artikelnummer || 'UNKNOWN',
          artikelbezeichnung: e.artikelbezeichnung || 'Unknown Item',
          menge: e.menge || 1,
          serialnummer: e.serialnummer || null
        };

        // If this entry needs lookup (from new QR format), try to get artikel_nummer from database
        if (e.needsLookup && e.serialnummer) {
          try {
            const productData = await lookupProductBySerial(e.serialnummer);
            if (productData && productData.artikel_nummer) {
              entry.artikelnummer = productData.artikel_nummer;
            } else {
              notificationStore.warning('Warnung', `Artikel-Nummer für Seriennummer ${e.serialnummer} konnte nicht gefunden werden. Verwende 'UNKNOWN'.`);
            }
          } catch (err) {
            notificationStore.warning('Warnung', `Fehler beim Nachschlagen der Seriennummer ${e.serialnummer}. Verwende 'UNKNOWN'.`);
          }
        } else if (e.needsLookup && e.lieferscheinNummer && e.artikelnummer === 'ZUBEHOER_LOOKUP') {
          // Handle Zubehör lookup by Lieferschein number
          try {
            const zubehoerEntries = await lookupZubehoerByLieferschein(e.lieferscheinNummer);
            if (zubehoerEntries && zubehoerEntries.length > 0) {
              // Add all Zubehör entries instead of the lookup entry
              for (const zEntry of zubehoerEntries) {
                enriched.push({
                  artikelnummer: zEntry.artikelnummer || 'UNKNOWN',
                  artikelbezeichnung: zEntry.artikelbezeichnung || 'Unknown Item',
                  menge: zEntry.menge || 1,
                  serialnummer: null
                });
              }
              continue; // Skip adding the original entry
            } else {
              entry.artikelbezeichnung = `Zubehör (Lieferschein: ${e.lieferscheinNummer}) - Not Found`;
              notificationStore.warning('Warnung', `Zubehör für Lieferschein ${e.lieferscheinNummer} konnte nicht gefunden werden.`);
            }
          } catch (err) {
            entry.artikelbezeichnung = `Zubehör (Lieferschein: ${e.lieferscheinNummer}) - Error`;
            notificationStore.warning('Warnung', `Fehler beim Nachschlagen der Lieferschein ${e.lieferscheinNummer}.`);
          }
        }

        enriched.push(entry);
      }

      const res = await fetch('/api/outerkarton', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          entries: enriched,
          lieferscheinNumber: lieferscheinNumber.trim() || null,
          printerIp: getPrinterIp()
        })
      });

      const result = await res.json();
      
      if (result.success) {
        notificationStore.success('Outer Karton gespeichert', 'Die Outer Karton Daten wurden erfolgreich gespeichert und das Etikett wurde gedruckt.');
        lieferscheinNumber = '';  // Clear Lieferschein number on success
        if (manualMode) {
          // Reset manual selections
          Object.keys(manualSelections).forEach(key => {
            manualSelections[key].selected = false;
          });
        } else {
          scannedQRs = [];
          scannedEntries = [];
        }
      } else {
        notificationStore.error('Speicherfehler', result.error || 'Fehler beim Speichern der Outer Karton Daten.');
      }
    } catch (err) {
      notificationStore.error('Verbindungsfehler', err instanceof Error ? err.message : 'Verbindungsfehler beim Speichern.');
    } finally {
      const form = document.querySelector('.form');
      if (form && form instanceof HTMLElement) {
        delete form.dataset.allowSubmit;
      }
    }
  }

  function toggleCategory(category: string) {
    expandedCategories[category] = !expandedCategories[category];
  }

  function getSelectedCount(categoryType: string): number {
    if (categoryType === 'zubehoer') {
      return availableZubehoer.filter(item => 
        manualSelections[`zubehoer_${item.id}`]?.selected
      ).length;
    } else {
      return availableProducts.filter(product => 
        product.type === categoryType && 
        manualSelections[`${product.type}_${product.serialnummer}`]?.selected
      ).length;
    }
  }
</script>

<svelte:head>
  <title>Außenkarton - QR-Scan Übersicht</title>
</svelte:head>

<div class="form-container">
  <form 
    on:submit|preventDefault={(e) => {
      if (!e.target || !(e.target as HTMLElement).dataset.allowSubmit) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
      submitOuterKarton();
    }} 
    class="form"
  >
    <h1 class="page-title">Außenkarton – QR-Scan Übersicht</h1>

    <div class="mode-switcher">
      <button 
        type="button"
        class="mode-button" 
        class:active={!manualMode}
        on:click={() => { manualMode = false; error = null; submitSuccess = false; }}
      >
        Scan-Modus
      </button>
      <button 
        type="button"
        class="mode-button" 
        class:active={manualMode}
        on:click={switchMode}
      >
        Manuelle Auswahl
      </button>
    </div>

    <!-- Lieferschein Number Input -->
    <div class="lieferschein-section">
      <label for="lieferscheinInput" class="input-label">Auftrags Nummer:</label>
      <input 
        id="lieferscheinInput" 
        type="text" 
        bind:value={lieferscheinNumber}
        class="lieferschein-input"
      />
    </div>

    {#if !manualMode}
    <!-- Scanning Mode -->
    <div class="scan-section">
      <div class="input-section">
        <label for="scanInput" class="input-label">QR-Code scannen oder einfügen:</label>
        <div class="input-wrapper">
          <input 
            id="scanInput" 
            type="text" 
            bind:value={scanInput} 
            class="scan-input"
            on:keydown={(e) => {
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }}
            on:keyup={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            on:input={(e) => {
              e.stopPropagation();
            }}
          />
          <button type="button" class="scan-button" on:click={handleScanInput}>
            Hinzufügen
          </button>
        </div>
      </div>

      {#if scannedQRs.length > 0}
        <div class="results-section">
          <h2 class="section-title">
            Gescannte QR-Codes ({scannedQRs.length})
          </h2>
          <div class="scan-grid">
            {#each scannedQRs as qr, index}
              <div class="scan-item">
                <span class="scan-number">QR {index + 1}</span>
                <button type="button" class="remove-button" on:click={() => { scannedQRs = scannedQRs.filter((_, i) => i !== index); scannedEntries = []; }}>
                  ✕
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    {:else}
    <div class="manual-section">
      <h2 class="section-title">
        Produkte manuell auswählen
      </h2>
      
      <div class="product-categories">
        {#if availableProducts.filter(p => p.type === 'cpro').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.cpro}
              on:click={() => toggleCategory('cpro')}
            >
              <div class="category-header-content">
                <h3 class="category-title">C Pro Steuerrechner</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('cpro')} / {availableProducts.filter(p => p.type === 'cpro').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.cpro} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.cpro}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'cpro') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- C2 Products -->
        {#if availableProducts.filter(p => p.type === 'c2').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.c2}
              on:click={() => toggleCategory('c2')}
            >
              <div class="category-header-content">
                <h3 class="category-title">C2 Steuerrechner</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('c2')} / {availableProducts.filter(p => p.type === 'c2').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.c2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.c2}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'c2') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- C Basic Products -->
        {#if availableProducts.filter(p => p.type === 'cbasic').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.cbasic}
              on:click={() => toggleCategory('cbasic')}
            >
              <div class="category-header-content">
                <h3 class="category-title">C Basic Steuerrechner</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('cbasic')} / {availableProducts.filter(p => p.type === 'cbasic').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.cbasic} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.cbasic}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'cbasic') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- KK Products -->
        {#if availableProducts.filter(p => p.type === 'kk').length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.kk}
              on:click={() => toggleCategory('kk')}
            >
              <div class="category-header-content">
                <h3 class="category-title">Kamerakopf</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('kk')} / {availableProducts.filter(p => p.type === 'kk').length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.kk} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.kk}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableProducts.filter(p => p.type === 'kk') as product}
                  <div class="product-row" class:selected={manualSelections[`${product.type}_${product.serialnummer}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`${product.type}_${product.serialnummer}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">{product.artikel_bezeichnung}</span>
                        <span class="product-serial">SN: {product.serialnummer}</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}

        <!-- Zubehör Products -->
        {#if availableZubehoer.length > 0}
          <div class="category-container">
            <button 
              type="button" 
              class="category-header"
              class:expanded={expandedCategories.zubehoer}
              on:click={() => toggleCategory('zubehoer')}
            >
              <div class="category-header-content">
                <h3 class="category-title">Zubehör</h3>
                <div class="category-info">
                  <span class="category-count">
                    {getSelectedCount('zubehoer')} / {availableZubehoer.length} ausgewählt
                  </span>
                  <svg class="category-arrow" class:rotated={expandedCategories.zubehoer} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 10L12 15L17 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
            </button>
            
            {#if expandedCategories.zubehoer}
              <div class="product-list" in:slide="{{ duration: 300 }}" out:slide="{{ duration: 200 }}">
                {#each availableZubehoer as zubehoer}
                  <div class="product-row" class:selected={manualSelections[`zubehoer_${zubehoer.id}`].selected}>
                    <label class="product-item">
                      <input 
                        type="checkbox" 
                        bind:checked={manualSelections[`zubehoer_${zubehoer.id}`].selected}
                        on:change={handleManualSelection}
                        class="product-checkbox"
                      />
                      <div class="product-content">
                        <span class="product-name">Zubehör Etikett #{zubehoer.id}</span>
                        <span class="product-serial">({zubehoer.entries?.length || 0} Artikel)</span>
                      </div>
                    </label>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>
    {/if}

    {#if finalGroupedEntries.length > 0}
    <div class="preview-section">
      <h3 class="section-title">
        Vorschau
      </h3>
      <div class="table-container">
        <table class="preview-table">
          <thead>
            <tr>
              <th>Artikelnummer</th>
              <th>Artikelbezeichnung</th>
              <th>Menge</th>
              <th>Seriennummer</th>
            </tr>
          </thead>
          <tbody>
            {#each finalGroupedEntries as entry}
              <tr>
                <td class="table-cell">
                  {#if entry.needsLookup}
                    <span class="lookup-needed">
                      {entry.artikelnummer || 'Wird nachgeschlagen...'}
                    </span>
                  {:else}
                    {entry.artikelnummer}
                  {/if}
                </td>
                <td class="table-cell">{entry.artikelbezeichnung}</td>
                <td class="table-cell numeric">{entry.menge}</td>
                <td class="table-cell">{entry.serialnummer || '-'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <button 
        type="submit" 
        class="create-button"
        on:click={(e) => {
          if (e.target && (e.target as Element).closest && (e.target as Element).closest('form')) {
            ((e.target as Element).closest('form') as HTMLElement).dataset.allowSubmit = 'true';
          }
        }}
      >
        Etikett erstellen
      </button>
    </div>
    {/if}
  </form>
</div>

<style>
  .form-container {
    min-height: 100vh;
    padding: var(--spacing-lg) var(--spacing-md);
    /* background: linear-gradient(135deg, var(--bg-light) 0%, var(--white) 100%); */
  }

  .form {
    max-width: 1200px;
    margin: 0 auto;
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    box-shadow: var(--shadow-medium);
    border: 1px solid var(--border-light);
    position: relative;
    overflow: hidden;
  }

  .form::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  }

  .page-title {
    font-size: var(--font-size-xxl);
    font-weight: var(--font-weight-bold);
    color: var(--text-primary);
    text-align: center;
    margin-bottom: var(--spacing-xl);
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .mode-switcher {
    display: flex;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-xl);
    background: var(--bg-light);
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-sm);
  }

  .mode-button {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-light);
    background: var(--white);
    color: var(--text-secondary);
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-smooth);
    font-size: var(--font-size-base);
    font-weight: var(--font-weight-semibold);
    min-height: 50px;
  }

  .mode-button:hover {
    border-color: var(--primary-color);
    background: var(--primary-light);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .mode-button.active {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
    border-color: var(--primary-color);
    box-shadow: var(--shadow-md);
  }

  .scan-section {
    background: var(--bg-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-light);
  }

  .input-section {
    margin-bottom: var(--spacing-xl);
  }

  .input-label {
    display: block;
    margin-bottom: var(--spacing-md);
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-lg);
  }

  .input-wrapper {
    display: flex;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .scan-input {
    flex: 1;
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-medium);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: all var(--transition-smooth);
    background: var(--white);
    min-height: 50px;
    box-sizing: border-box;
  }

  .scan-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
    background: var(--bg-light);
  }

  .lieferschein-section {
    margin-bottom: var(--spacing-xl);
    padding: var(--spacing-lg);
    background: var(--bg-light);
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-md);
  }

  .lieferschein-input {
    width: 100%;
    padding: var(--spacing-md) var(--spacing-lg);
    border: 2px solid var(--border-medium);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: all var(--transition-smooth);
    background: var(--white);
    min-height: 50px;
    box-sizing: border-box;
  }

  .lieferschein-input:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-light);
    background: var(--bg-light);
  }

  .scan-button {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md) var(--spacing-lg);
    background: linear-gradient(135deg, var(--success-color), var(--success-hover));
    color: var(--white);
    border: none;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    transition: all var(--transition-smooth);
    font-weight: var(--font-weight-semibold);
    min-height: 50px;
    white-space: nowrap;
  }

  .scan-button:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    margin-bottom: var(--spacing-lg);
    border-bottom: 2px solid var(--border-light);
    padding-bottom: var(--spacing-md);
  }

  .results-section {
    background: var(--white);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-lg);
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
  }

  .scan-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-md);
  }

  .scan-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--bg-light), var(--white));
    border: 1px solid var(--border-light);
    border-radius: var(--border-radius-md);
    transition: all var(--transition-smooth);
  }

  .scan-item:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--primary-light);
  }

  .scan-number {
    font-weight: var(--font-weight-semibold);
    color: var(--primary-color);
  }

  .remove-button {
    background: var(--danger-color);
    color: var(--white);
    border: none;
    border-radius: var(--border-radius-full);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all var(--transition-smooth);
    font-size: var(--font-size-sm);
  }

  .remove-button:hover {
    background: var(--danger-hover);
    transform: scale(1.1);
  }

  .manual-section {
    background: var(--bg-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
    border: 1px solid var(--border-light);
  }

  .product-categories {
    display: grid;
    gap: var(--spacing-xl);
  }

  .category-container {
    background: var(--white);
    border: 2px solid var(--border-light);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-lg);
    transition: all var(--transition-smooth);
    position: relative;
    overflow: hidden;
  }

  .category-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  }

  .category-container:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary-light);
  }

  .category-header {
    width: 100%;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-smooth);
    border-radius: var(--border-radius-md);
    padding: var(--spacing-md);
    margin: calc(-1 * var(--spacing-md));
    margin-bottom: var(--spacing-lg);
  }

  .category-header:hover {
    background: var(--primary-light);
  }

  .category-header.expanded {
    background: linear-gradient(135deg, var(--primary-light), var(--white));
    border-bottom: 1px solid var(--border-light);
    border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
    margin-bottom: 0;
  }

  .category-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .category-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--primary-color);
    margin: 0;
  }

  .category-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }

  .category-count {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    font-weight: var(--font-weight-medium);
    background: var(--bg-light);
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--border-radius-full);
    border: 1px solid var(--border-light);
  }

  .category-arrow {
    width: 20px;
    height: 20px;
    color: var(--primary-color);
    transition: transform var(--transition-smooth);
    flex-shrink: 0;
  }

  .category-arrow.rotated {
    transform: rotate(180deg);
  }

  .product-list {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    background: var(--white);
    border-top: 1px solid var(--border-light);
    padding-top: var(--spacing-md);
    margin-top: var(--spacing-lg);
  }

  .product-row {
    border-radius: var(--border-radius-md);
    transition: all var(--transition-smooth);
    border: 1px solid transparent;
  }

  .product-row:hover {
    background: var(--primary-light);
    border-color: var(--primary-color);
    transform: translateX(4px);
  }

  .product-row.selected {
    background: linear-gradient(135deg, var(--primary-light), var(--white));
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }

  .product-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md);
    cursor: pointer;
    width: 100%;
    border-radius: var(--border-radius-md);
    transition: all var(--transition-smooth);
  }

  .product-checkbox {
    width: 20px;
    height: 20px;
    accent-color: var(--primary-color);
    cursor: pointer;
    flex-shrink: 0;
  }

  .product-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
    flex: 1;
    min-width: 0;
  }

  .product-name {
    font-weight: var(--font-weight-semibold);
    color: var(--text-primary);
    font-size: var(--font-size-base);
    line-height: 1.4;
  }

  .product-serial {
    font-size: var(--font-size-sm);
    color: var(--text-muted);
    font-weight: var(--font-weight-medium);
    font-family: monospace;
  }

  .preview-section {
    background: var(--white);
    border-radius: var(--border-radius-lg);
    padding: var(--spacing-xl);
    border: 1px solid var(--border-light);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-xl);
  }

  .table-container {
    margin: var(--spacing-lg) 0;
    overflow-x: auto;
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-sm);
    /* Improved mobile scrolling */
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: var(--primary-color) var(--bg-light);
  }

  .table-container::-webkit-scrollbar {
    height: 8px;
  }

  .table-container::-webkit-scrollbar-track {
    background: var(--bg-light);
    border-radius: var(--border-radius-sm);
  }

  .table-container::-webkit-scrollbar-thumb {
    background: var(--primary-color);
    border-radius: var(--border-radius-sm);
  }

  .table-container::-webkit-scrollbar-thumb:hover {
    background: var(--primary-hover);
  }

  .preview-table {
    width: 100%;
    border-collapse: collapse;
    background: var(--white);
    border-radius: var(--border-radius-md);
    overflow: hidden;
    min-width: 600px; /* Ensure minimum width for proper column display */
  }

  .preview-table th {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
    color: var(--white);
    padding: var(--spacing-md) var(--spacing-lg);
    text-align: left;
    font-weight: var(--font-weight-bold);
    font-size: var(--font-size-base);
    border: none;
    white-space: nowrap; /* Prevent header text wrapping */
    min-width: 120px; /* Minimum column width */
  }

  .preview-table .table-cell {
    padding: var(--spacing-md) var(--spacing-lg);
    border-bottom: 1px solid var(--border-light);
    font-size: var(--font-size-base);
    color: var(--text-primary);
    transition: background-color var(--transition-smooth);
    min-width: 120px; /* Minimum column width */
    word-break: break-word; /* Allow long text to wrap within cells */
  }

  .preview-table tr:hover .table-cell {
    background: var(--bg-light);
  }

  .preview-table tr:last-child .table-cell {
    border-bottom: none;
  }

  .table-cell.numeric {
    text-align: center;
    font-weight: var(--font-weight-semibold);
  }

  .lookup-needed {
    color: var(--orange);
    font-style: italic;
    font-size: 0.9em;
  }

  .create-button {
    width: 100%;
    max-width: 400px;
    margin: var(--spacing-xl) auto 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
    padding: var(--spacing-lg) var(--spacing-xl);
    background: linear-gradient(135deg, var(--success-color), var(--success-hover));
    color: var(--white);
    border: none;
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    cursor: pointer;
    transition: all var(--transition-smooth);
    min-height: 60px;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: var(--shadow-md);
    position: relative;
    overflow: hidden;
  }

  .create-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s ease;
  }

  .create-button:hover::before {
    left: 100%;
  }

  .create-button:hover {
    background: linear-gradient(135deg, var(--success-hover), var(--success-color));
    transform: translateY(-3px);
    box-shadow: var(--shadow-lg);
  }

  .create-button:active {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .form-container {
      padding: var(--spacing-md) var(--spacing-sm);
    }

    .form {
      padding: var(--spacing-lg);
    }

    .page-title {
      font-size: var(--font-size-xl);
      margin-bottom: var(--spacing-lg);
    }

    .mode-switcher {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .mode-button {
      flex: none;
    }

    .input-wrapper {
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .scan-button {
      justify-content: center;
    }

    .scan-grid {
      grid-template-columns: 1fr;
    }

    .scan-section,
    .manual-section,
    .preview-section {
      padding: var(--spacing-lg);
    }

    .table-container {
      font-size: var(--font-size-sm);
      /* Ensure scrolling hint on mobile */
      position: relative;
    }

    .table-container::after {
      content: '← Swipe to scroll →';
      position: absolute;
      bottom: -25px;
      left: 50%;
      transform: translateX(-50%);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
      font-style: italic;
      white-space: nowrap;
    }

    .preview-table {
      min-width: 700px; /* Increase minimum width on mobile for better readability */
    }

    .preview-table th,
    .preview-table .table-cell {
      padding: var(--spacing-sm) var(--spacing-md);
      min-width: 100px; /* Slightly smaller min-width on mobile */
      font-size: var(--font-size-sm);
    }

    .create-button {
      font-size: var(--font-size-base);
      padding: var(--spacing-md) var(--spacing-lg);
      min-height: 50px;
    }
  }

  @media (max-width: 480px) {
    .form-container {
      padding: var(--spacing-sm);
    }

    .form {
      padding: var(--spacing-md);
      border-radius: var(--border-radius-md);
    }

    .page-title {
      font-size: var(--font-size-lg);
    }

    .section-title {
      font-size: var(--font-size-lg);
      flex-direction: column;
      gap: var(--spacing-xs);
      text-align: center;
    }

    .category-container {
      padding: var(--spacing-md);
    }

    .category-header {
      margin: calc(-1 * var(--spacing-md));
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-sm);
    }

    .category-header.expanded {
      margin-bottom: 0;
    }

    .category-info {
      flex-direction: column;
      gap: var(--spacing-xs);
      align-items: flex-end;
    }

    .product-item {
      padding: var(--spacing-sm) var(--spacing-md);
    }

    .preview-table {
      min-width: 800px; /* Even wider on smallest screens to ensure readability */
    }

    .preview-table th,
    .preview-table .table-cell {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-xs);
      min-width: 90px;
    }

    .table-container::after {
      bottom: -20px;
      font-size: 10px;
    }

    .create-button {
      min-height: 48px;
    }
  }
</style>
