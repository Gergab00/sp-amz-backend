import { MfnQuantity } from './mfn-quantity.entity.domain';

describe('MfnQuantity Entity', () => {
  describe('create', () => {
    it('should create a valid MfnQuantity entity', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        50,
        'DEFAULT',
      );

      expect(entity).toBeDefined();
      expect(entity.sku).toBe('TEST-SKU-001');
      expect(entity.marketplaceId).toBe('A1AM78C64UM0Y8');
      expect(entity.quantity).toBe(50);
      expect(entity.fulfillmentChannel).toBe('DEFAULT');
    });

    it('should throw error when SKU is empty', () => {
      expect(() => {
        MfnQuantity.create('', 'A1AM78C64UM0Y8', 50, 'DEFAULT');
      }).toThrow('SKU cannot be empty');
    });

    it('should throw error when marketplace ID is empty', () => {
      expect(() => {
        MfnQuantity.create('TEST-SKU-001', '', 50, 'DEFAULT');
      }).toThrow('Marketplace ID cannot be empty');
    });

    it('should throw error when quantity is negative', () => {
      expect(() => {
        MfnQuantity.create('TEST-SKU-001', 'A1AM78C64UM0Y8', -5, 'DEFAULT');
      }).toThrow('Available quantity cannot be negative');
    });

    it('should throw error when fulfillment channel is invalid', () => {
      expect(() => {
        MfnQuantity.create('TEST-SKU-001', 'A1AM78C64UM0Y8', 50, 'INVALID');
      }).toThrow('Invalid fulfillment channel');
    });

    it('should accept valid fulfillment channels', () => {
      const validChannels = ['DEFAULT', 'MFN', 'AFN', 'Amazon_NA'];

      validChannels.forEach((channel) => {
        expect(() => {
          MfnQuantity.create('TEST-SKU-001', 'A1AM78C64UM0Y8', 50, channel);
        }).not.toThrow();
      });
    });
  });

  describe('isAvailable', () => {
    it('should return true when quantity is greater than 0', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        10,
        'DEFAULT',
      );
      expect(entity.isAvailable()).toBe(true);
    });

    it('should return false when quantity is 0', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        0,
        'DEFAULT',
      );
      expect(entity.isAvailable()).toBe(false);
    });
  });

  describe('canFulfillOrder', () => {
    const entity = MfnQuantity.create(
      'TEST-SKU-001',
      'A1AM78C64UM0Y8',
      20,
      'DEFAULT',
    );

    it('should return true when requested quantity is available', () => {
      expect(entity.canFulfillOrder(10)).toBe(true);
      expect(entity.canFulfillOrder(20)).toBe(true);
    });

    it('should return false when requested quantity exceeds available', () => {
      expect(entity.canFulfillOrder(21)).toBe(false);
      expect(entity.canFulfillOrder(100)).toBe(false);
    });

    it('should throw error when requested quantity is not positive', () => {
      expect(() => entity.canFulfillOrder(0)).toThrow(
        'Requested quantity must be positive',
      );
      expect(() => entity.canFulfillOrder(-5)).toThrow(
        'Requested quantity must be positive',
      );
    });
  });

  describe('reduceQuantity', () => {
    it('should reduce quantity when sufficient stock available', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        50,
        'DEFAULT',
      );

      entity.reduceQuantity(10);
      expect(entity.quantity).toBe(40);

      entity.reduceQuantity(30);
      expect(entity.quantity).toBe(10);
    });

    it('should throw error when reducing more than available', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        10,
        'DEFAULT',
      );

      expect(() => entity.reduceQuantity(15)).toThrow(
        'Insufficient quantity available',
      );
    });

    it('should throw error when quantity to reduce is not positive', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        50,
        'DEFAULT',
      );

      expect(() => entity.reduceQuantity(0)).toThrow(
        'Quantity to reduce must be positive',
      );
      expect(() => entity.reduceQuantity(-5)).toThrow(
        'Quantity to reduce must be positive',
      );
    });
  });

  describe('increaseQuantity', () => {
    it('should increase quantity correctly', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        10,
        'DEFAULT',
      );

      entity.increaseQuantity(20);
      expect(entity.quantity).toBe(30);

      entity.increaseQuantity(5);
      expect(entity.quantity).toBe(35);
    });

    it('should throw error when quantity to increase is not positive', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        10,
        'DEFAULT',
      );

      expect(() => entity.increaseQuantity(0)).toThrow(
        'Quantity to increase must be positive',
      );
      expect(() => entity.increaseQuantity(-10)).toThrow(
        'Quantity to increase must be positive',
      );
    });
  });

  describe('isBelowThreshold', () => {
    const entity = MfnQuantity.create(
      'TEST-SKU-001',
      'A1AM78C64UM0Y8',
      15,
      'DEFAULT',
    );

    it('should return true when quantity is below threshold', () => {
      expect(entity.isBelowThreshold(20)).toBe(true);
      expect(entity.isBelowThreshold(16)).toBe(true);
    });

    it('should return false when quantity is at or above threshold', () => {
      expect(entity.isBelowThreshold(15)).toBe(false);
      expect(entity.isBelowThreshold(10)).toBe(false);
    });

    it('should throw error when threshold is negative', () => {
      expect(() => entity.isBelowThreshold(-5)).toThrow(
        'Threshold cannot be negative',
      );
    });
  });

  describe('getStockLevel', () => {
    it('should return "out-of-stock" when quantity is 0', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        0,
        'DEFAULT',
      );
      expect(entity.getStockLevel()).toBe('out-of-stock');
    });

    it('should return "low" when quantity is below low threshold', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        5,
        'DEFAULT',
      );
      expect(entity.getStockLevel()).toBe('low');
    });

    it('should return "medium" when quantity is between low and high thresholds', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        30,
        'DEFAULT',
      );
      expect(entity.getStockLevel()).toBe('medium');
    });

    it('should return "high" when quantity is at or above high threshold', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        50,
        'DEFAULT',
      );
      expect(entity.getStockLevel()).toBe('high');

      const entity2 = MfnQuantity.create(
        'TEST-SKU-002',
        'A1AM78C64UM0Y8',
        100,
        'DEFAULT',
      );
      expect(entity2.getStockLevel()).toBe('high');
    });

    it('should respect custom thresholds', () => {
      const entity = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        25,
        'DEFAULT',
      );

      expect(entity.getStockLevel(20, 30)).toBe('medium');
      expect(entity.getStockLevel(30, 50)).toBe('low');
    });
  });

  describe('hasMoreQuantityThan', () => {
    it('should return true when this entity has more quantity', () => {
      const entity1 = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        50,
        'DEFAULT',
      );
      const entity2 = MfnQuantity.create(
        'TEST-SKU-002',
        'A1AM78C64UM0Y8',
        30,
        'DEFAULT',
      );

      expect(entity1.hasMoreQuantityThan(entity2)).toBe(true);
    });

    it('should return false when this entity has equal or less quantity', () => {
      const entity1 = MfnQuantity.create(
        'TEST-SKU-001',
        'A1AM78C64UM0Y8',
        30,
        'DEFAULT',
      );
      const entity2 = MfnQuantity.create(
        'TEST-SKU-002',
        'A1AM78C64UM0Y8',
        30,
        'DEFAULT',
      );
      const entity3 = MfnQuantity.create(
        'TEST-SKU-003',
        'A1AM78C64UM0Y8',
        50,
        'DEFAULT',
      );

      expect(entity1.hasMoreQuantityThan(entity2)).toBe(false);
      expect(entity1.hasMoreQuantityThan(entity3)).toBe(false);
    });
  });
});

/** =============================================================
 * ARQUITECTURA LIMPIA - TESTS DE ENTIDAD RICA:
 * Estos tests verifican:
 * - Validaciones de invariantes en construcción
 * - Comportamiento de negocio de la entidad
 * - Encapsulación y mutación controlada
 * - Edge cases y validaciones de entrada
 *
 * Los tests son unitarios y no requieren infraestructura,
 * validando la lógica de dominio pura.
 * ============================================================= */
