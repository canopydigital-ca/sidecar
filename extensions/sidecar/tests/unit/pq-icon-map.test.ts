import { describe, it, expect } from 'vitest';
import iconMap from '../../src/vendor/game-icons.net/ffffff/pq-icon-map-v2.json';
import schema from '../../src/vendor/game-icons.net/ffffff/pq-icon-map.schema.json';

describe('PQ Icon Map v2', () => {
  it('should have valid metadata', () => {
    expect(iconMap.metadata).toBeDefined();
    expect(iconMap.metadata.version).toBe('2.0.0');
    expect(iconMap.metadata.generator).toBe('Trae-Gemini-PQ-Mapper');
  });

  it('should have a list of nodes', () => {
    expect(Array.isArray(iconMap.nodes)).toBe(true);
    expect(iconMap.nodes.length).toBeGreaterThan(0);
  });

  it('should ensure all nodes conform to schema requirements (manual check)', () => {
    iconMap.nodes.forEach(node => {
      expect(node.id).toBeTypeOf('string');
      expect(node.path).toBeTypeOf('string');
      expect(node.rarityHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(Array.isArray(node.tags)).toBe(true);
      expect(Array.isArray(node.itemTypes)).toBe(true);
      expect(node.itemTypes.length).toBeGreaterThan(0);
      expect(node.visualGroup).toBeTypeOf('string');
      expect(node.paletteSwaps).toBeDefined();
      expect(node.paletteSwaps.primary).toBeDefined();
    });
  });

  it('should map specific PQ items correctly', () => {
    // Helper to find node by item name
    const findNode = (itemName: string) => {
      return iconMap.nodes.find(n => n.itemTypes.includes(itemName));
    };

    // Test specific items
    const sword = findNode('Broadsword');
    expect(sword).toBeDefined();
    expect(sword?.path).toContain('broadsword');
    expect(sword?.tags).toContain('weapon');

    const cheese = findNode('Stinky cheese');
    expect(cheese).toBeDefined();
    expect(cheese?.path).toContain('cheese');
    expect(cheese?.visualGroup).toContain('misc');

    // Test a high tier one
    const ultima = findNode('Ultima Blade');
    expect(ultima).toBeDefined();
    expect(ultima?.rarityHex).toBe('#B8860B'); // Unique color

    const junk = findNode('Hollow log');
    expect(junk).toBeDefined();
    expect(junk?.rarityHex).toBe('#FFFFFF'); // Common color (tier 0)
  });

  it('should have hierarchical visual groups', () => {
    const weaponNodes = iconMap.nodes.filter(n => n.tags.includes('weapon') && !n.visualGroup.startsWith('misc_'));
    weaponNodes.forEach(node => {
      expect(node.visualGroup).toMatch(/^weapons_/);
    });

    const armorNodes = iconMap.nodes.filter(n => n.tags.includes('armor') && !n.visualGroup.startsWith('misc_'));
    armorNodes.forEach(node => {
      expect(node.visualGroup).toMatch(/^armor_/);
    });
  });
});
