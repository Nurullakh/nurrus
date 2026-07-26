import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../users/users.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // Helper для парсинга specifications если они пришли как строка
  private parseSpecifications(product: Product): Product {
    if (product && product.specifications) {
      if (typeof product.specifications === 'string') {
        try {
          product.specifications = JSON.parse(product.specifications);
        } catch {
          product.specifications = {};
        }
      }
    }
    return product;
  }

  // Helper для массива продуктов
  private parseSpecificationsArray(products: Product[]): Product[] {
    return products.map((product) => this.parseSpecifications(product));
  }

  private isAdmin(user: Pick<User, 'role'>): boolean {
    return user.role === 'admin';
  }

  private isSeller(user: Pick<User, 'role'>): boolean {
    return user.role === 'seller';
  }

  private parseBoolean(value: string | undefined, fallback: boolean): boolean {
    if (value === undefined || value === null || value === '') {
      return fallback;
    }
    const normalized = value.trim().toLowerCase();
    return ['1', 'true', 'yes', 'y', 'да'].includes(normalized);
  }

  private escapeCsvCell(value: unknown): string {
    const stringValue = value === null || value === undefined ? '' : String(value);
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  private detectCsvDelimiter(line: string): ',' | ';' {
    let inQuotes = false;
    let commaCount = 0;
    let semicolonCount = 0;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes) {
        if (char === ',') {
          commaCount += 1;
        } else if (char === ';') {
          semicolonCount += 1;
        }
      }
    }

    return semicolonCount > commaCount ? ';' : ',';
  }

  private parseCsv(content: string): Record<string, string>[] {
    const normalizedContent = content.replace(/^\uFEFF/, '');
    if (!normalizedContent.trim()) {
      return [];
    }

    const firstLineBreakIndex = normalizedContent.search(/\r?\n/);
    const firstLine =
      firstLineBreakIndex === -1
        ? normalizedContent
        : normalizedContent.slice(0, firstLineBreakIndex);
    const delimiter = this.detectCsvDelimiter(firstLine);

    const parsedRows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < normalizedContent.length; i += 1) {
      const char = normalizedContent[i];
      const nextChar = normalizedContent[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (!inQuotes && char === delimiter) {
        currentRow.push(currentCell);
        currentCell = '';
        continue;
      }

      if (!inQuotes && (char === '\n' || char === '\r')) {
        currentRow.push(currentCell);
        currentCell = '';
        if (char === '\r' && nextChar === '\n') {
          i += 1;
        }
        parsedRows.push(currentRow);
        currentRow = [];
        continue;
      }

      currentCell += char;
    }

    if (currentCell.length > 0 || currentRow.length > 0) {
      currentRow.push(currentCell);
      parsedRows.push(currentRow);
    }

    if (!parsedRows.length) {
      return [];
    }

    const headers = parsedRows[0].map((header) => header.trim().toLowerCase());

    return parsedRows
      .slice(1)
      .filter((row) => row.some((cell) => cell.trim() !== ''))
      .map((values) => {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          if (header) {
            row[header] = values[index] ?? '';
          }
        });
        return row;
      });
  }

  private async getScopedProductsByIds(
    productIds: number[],
    user: Pick<User, 'id' | 'role'>,
  ): Promise<Product[]> {
    const uniqueIds = [...new Set(productIds.map((id) => Number(id)).filter(Boolean))];
    if (!uniqueIds.length) {
      throw new BadRequestException('Не выбраны товары для массового действия');
    }

    const products = await this.productsRepository.find({
      where: { id: In(uniqueIds) },
      relations: ['categoryRelation'],
    });

    if (products.length !== uniqueIds.length) {
      throw new NotFoundException('Часть товаров не найдена');
    }

    if (!this.isAdmin(user)) {
      const hasForeignProducts = products.some((product) => product.ownerId !== user.id);
      if (hasForeignProducts) {
        throw new ForbiddenException('Можно применять действие только к своим товарам');
      }
    }

    return products;
  }

  async findAllPaginated(page: number = 1, limit: number = 10, search?: string) {
    const builder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryRelation', 'categoryRelation')
      .where('product.moderationStatus = :moderationStatus', {
        moderationStatus: 'approved',
      })
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (search && search.trim()) {
      builder.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.name) LIKE LOWER(:search)', {
            search: `%${search.trim()}%`,
          })
            .orWhere('LOWER(product.description) LIKE LOWER(:search)', {
              search: `%${search.trim()}%`,
            })
            .orWhere('LOWER(product.category) LIKE LOWER(:search)', {
              search: `%${search.trim()}%`,
            });
        }),
      );
    }

    const [products, total] = await builder.getManyAndCount();

    return {
      data: this.parseSpecificationsArray(products),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAdminPaginated(
    user: Pick<User, 'id' | 'role'>,
    page: number = 1,
    limit: number = 10,
    search?: string,
    moderationStatus?: string,
  ) {
    const builder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryRelation', 'categoryRelation')
      .orderBy('product.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (!this.isAdmin(user)) {
      builder.andWhere('product.ownerId = :ownerId', { ownerId: user.id });
    }

    if (search && search.trim()) {
      builder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search) OR LOWER(product.category) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    if (moderationStatus) {
      builder.andWhere('product.moderationStatus = :moderationStatus', {
        moderationStatus,
      });
    }

    const [products, total] = await builder.getManyAndCount();

    return {
      data: this.parseSpecificationsArray(products),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product | null> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['categoryRelation'],
    });
    return product ? this.parseSpecifications(product) : null;
  }

  async findPublicOne(id: number): Promise<Product | null> {
    const product = await this.productsRepository.findOne({
      where: { id, moderationStatus: 'approved' },
      relations: ['categoryRelation'],
    });
    return product ? this.parseSpecifications(product) : null;
  }

  async createProduct(
    dto: CreateProductDto,
    user: Pick<User, 'id' | 'role'>,
  ): Promise<Product> {
    const isAdmin = this.isAdmin(user);
    const newProduct = this.productsRepository.create({
      ...dto,
      rating: dto.rating ?? 0, // Если не передан, то 0
      reviews_count: dto.reviews_count ?? 0,
      is_available: dto.is_available ?? true,
      ownerId: isAdmin ? null : user.id,
      moderationStatus: isAdmin ? 'approved' : 'draft',
      moderatedAt: isAdmin ? new Date() : null,
      moderatedById: isAdmin ? user.id : null,
      moderationComment: null,
    });
    return await this.productsRepository.save(newProduct);
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const products = await this.productsRepository
      .createQueryBuilder('product')
      .where('product.moderationStatus = :moderationStatus', {
        moderationStatus: 'approved',
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(product.name) LIKE LOWER(:query)', {
            query: `%${query}%`,
          })
            .orWhere('LOWER(product.description) LIKE LOWER(:query)', {
              query: `%${query}%`,
            })
            .orWhere('LOWER(product.category) LIKE LOWER(:query)', {
              query: `%${query}%`,
            });
        }),
      )
      .take(limit)
      .getMany();

    return this.parseSpecificationsArray(products);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .andWhere("product.category != ''")
      .andWhere('product.moderationStatus = :moderationStatus', {
        moderationStatus: 'approved',
      })
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  async findByCategory(category: string, page: number = 1, limit: number = 40) {
    const [products, total] = await this.productsRepository.findAndCount({
      where: { category, moderationStatus: 'approved' },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['categoryRelation'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: this.parseSpecificationsArray(products),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      category,
    };
  }

  async findByCategoryId(
    categoryId: number,
    page: number = 1,
    limit: number = 40,
  ) {
    const [products, total] = await this.productsRepository.findAndCount({
      where: { categoryId, moderationStatus: 'approved' },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['categoryRelation'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: this.parseSpecificationsArray(products),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categoryId,
    };
  }

  async updateProduct(
    id: number,
    dto: UpdateProductDto,
    user: Pick<User, 'id' | 'role'>,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    if (!this.isAdmin(user) && product.ownerId !== user.id) {
      throw new ForbiddenException('Вы можете изменять только свои товары');
    }

    if (this.isSeller(user)) {
      // После изменения продавцом товар снова идет через модерацию.
      dto = {
        ...dto,
        moderationStatus: 'draft',
        moderationComment: null,
        moderatedAt: null,
        moderatedById: null,
      } as UpdateProductDto;
    }

    await this.productsRepository.update(id, dto);
    const updatedProduct = await this.findOne(id);

    if (!updatedProduct) {
      throw new NotFoundException(
        `Товар с ID ${id} не найден после обновления`,
      );
    }

    return updatedProduct;
  }

  async deleteProduct(id: number, user: Pick<User, 'id' | 'role'>): Promise<void> {
    const product = await this.findOne(id);

    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    if (!this.isAdmin(user) && product.ownerId !== user.id) {
      throw new ForbiddenException('Вы можете удалять только свои товары');
    }

    await this.productsRepository.delete(id);
  }

  async getAdminStatistics(user: Pick<User, 'id' | 'role'>) {
    const builder = this.productsRepository.createQueryBuilder('product');

    if (!this.isAdmin(user)) {
      builder.where('product.ownerId = :ownerId', { ownerId: user.id });
    }

    const [
      totalProducts,
      availableProducts,
      outOfStockProducts,
      draftProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      stockResult,
    ] =
      await Promise.all([
        builder.getCount(),
        builder
          .clone()
          .andWhere('product.is_available = :isAvailable', { isAvailable: true })
          .getCount(),
        builder.clone().andWhere('product.stock <= 0').getCount(),
        builder
          .clone()
          .andWhere('product.moderationStatus = :status', { status: 'draft' })
          .getCount(),
        builder
          .clone()
          .andWhere('product.moderationStatus = :status', { status: 'pending' })
          .getCount(),
        builder
          .clone()
          .andWhere('product.moderationStatus = :status', { status: 'approved' })
          .getCount(),
        builder
          .clone()
          .andWhere('product.moderationStatus = :status', { status: 'rejected' })
          .getCount(),
        builder
          .clone()
          .select('COALESCE(SUM(product.stock), 0)', 'totalStock')
          .getRawOne<{ totalStock: string }>(),
      ]);

    return {
      totalProducts,
      availableProducts,
      outOfStockProducts,
      draftProducts,
      pendingProducts,
      approvedProducts,
      rejectedProducts,
      totalStock: Number(stockResult?.totalStock ?? 0),
    };
  }

  async submitForModeration(id: number, user: Pick<User, 'id' | 'role'>) {
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Отправка на модерацию доступна только продавцу');
    }

    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
    if (product.ownerId !== user.id) {
      throw new ForbiddenException('Вы можете отправлять на модерацию только свои товары');
    }
    if (product.moderationStatus === 'pending') {
      throw new ConflictException('Товар уже ожидает модерации');
    }

    await this.productsRepository.update(id, {
      moderationStatus: 'pending',
      moderationComment: null,
      moderatedAt: null,
      moderatedById: null,
    });

    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
    return updated;
  }

  async approveProduct(
    id: number,
    user: Pick<User, 'id' | 'role'>,
  ): Promise<Product> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Подтверждать товар может только администратор');
    }

    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    await this.productsRepository.update(id, {
      moderationStatus: 'approved',
      moderationComment: null,
      moderatedAt: new Date(),
      moderatedById: user.id,
    });

    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
    return updated;
  }

  async rejectProduct(
    id: number,
    user: Pick<User, 'id' | 'role'>,
    reason?: string,
  ): Promise<Product> {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Отклонять товар может только администратор');
    }

    const product = await this.findOne(id);
    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    await this.productsRepository.update(id, {
      moderationStatus: 'rejected',
      moderationComment: reason?.trim() || null,
      moderatedAt: new Date(),
      moderatedById: user.id,
      is_available: false,
    });

    const updated = await this.findOne(id);
    if (!updated) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }
    return updated;
  }

  async bulkSubmitForModeration(
    productIds: number[],
    user: Pick<User, 'id' | 'role'>,
  ) {
    if (!this.isSeller(user)) {
      throw new ForbiddenException('Массовая отправка доступна только продавцу');
    }

    const products = await this.getScopedProductsByIds(productIds, user);
    const targetProducts = products.filter(
      (product) => product.moderationStatus === 'draft' || product.moderationStatus === 'rejected',
    );

    if (!targetProducts.length) {
      throw new ConflictException('Нет товаров, доступных для отправки на модерацию');
    }

    const targetIds = targetProducts.map((product) => product.id);
    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        moderationStatus: 'pending',
        moderationComment: null,
        moderatedAt: null,
        moderatedById: null,
      })
      .whereInIds(targetIds)
      .execute();

    return {
      updatedCount: targetIds.length,
      productIds: targetIds,
    };
  }

  async bulkApproveProducts(
    productIds: number[],
    user: Pick<User, 'id' | 'role'>,
  ) {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Массовое одобрение доступно только администратору');
    }

    const products = await this.getScopedProductsByIds(productIds, user);
    const targetIds = products
      .filter((product) => product.moderationStatus !== 'approved')
      .map((product) => product.id);

    if (!targetIds.length) {
      throw new ConflictException('Нет товаров для одобрения');
    }

    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        moderationStatus: 'approved',
        moderationComment: null,
        moderatedAt: new Date(),
        moderatedById: user.id,
      })
      .whereInIds(targetIds)
      .execute();

    return {
      updatedCount: targetIds.length,
      productIds: targetIds,
    };
  }

  async bulkRejectProducts(
    productIds: number[],
    reason: string | undefined,
    user: Pick<User, 'id' | 'role'>,
  ) {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Массовое отклонение доступно только администратору');
    }

    const products = await this.getScopedProductsByIds(productIds, user);
    const targetIds = products.map((product) => product.id);

    await this.productsRepository
      .createQueryBuilder()
      .update(Product)
      .set({
        moderationStatus: 'rejected',
        moderationComment: reason?.trim() || null,
        moderatedAt: new Date(),
        moderatedById: user.id,
        is_available: false,
      })
      .whereInIds(targetIds)
      .execute();

    return {
      updatedCount: targetIds.length,
      productIds: targetIds,
    };
  }

  async bulkUpdatePriceAndStock(
    productIds: number[],
    payload: {
      priceMode?: 'set' | 'delta';
      priceValue?: number;
      stockMode?: 'set' | 'delta';
      stockValue?: number;
    },
    user: Pick<User, 'id' | 'role'>,
  ) {
    const hasPriceUpdate =
      payload.priceMode !== undefined && payload.priceValue !== undefined;
    const hasStockUpdate =
      payload.stockMode !== undefined && payload.stockValue !== undefined;

    if (!hasPriceUpdate && !hasStockUpdate) {
      throw new BadRequestException(
        'Укажите параметры обновления цены и/или остатка',
      );
    }

    const products = await this.getScopedProductsByIds(productIds, user);
    let updatedCount = 0;

    for (const product of products) {
      const nextPrice = hasPriceUpdate
        ? payload.priceMode === 'set'
          ? Number(payload.priceValue)
          : Number(product.price) + Number(payload.priceValue)
        : Number(product.price);

      const nextStock = hasStockUpdate
        ? payload.stockMode === 'set'
          ? Number(payload.stockValue)
          : Number(product.stock) + Number(payload.stockValue)
        : Number(product.stock);

      if (Number.isNaN(nextPrice) || nextPrice < 0) {
        throw new BadRequestException('Некорректное значение цены');
      }
      if (!Number.isInteger(nextStock) || nextStock < 0) {
        throw new BadRequestException('Остаток должен быть целым числом >= 0');
      }

      await this.productsRepository.update(product.id, {
        price: nextPrice,
        stock: nextStock,
      });
      updatedCount += 1;
    }

    return {
      updatedCount,
      productIds: products.map((product) => product.id),
    };
  }

  async exportAdminProducts(
    user: Pick<User, 'id' | 'role'>,
    search?: string,
    moderationStatus?: string,
  ): Promise<string> {
    const builder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryRelation', 'categoryRelation')
      .orderBy('product.createdAt', 'DESC');

    if (!this.isAdmin(user)) {
      builder.andWhere('product.ownerId = :ownerId', { ownerId: user.id });
    }

    if (search && search.trim()) {
      builder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search) OR LOWER(product.category) LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    if (moderationStatus) {
      builder.andWhere('product.moderationStatus = :moderationStatus', {
        moderationStatus,
      });
    }

    const products = await builder.getMany();

    const headers = [
      'name',
      'description',
      'price',
      'category',
      'brand',
      'stock',
      'is_available',
      'article',
      'moderation_status',
      'specifications_json',
      'images_pipe',
    ];

    const rows = products.map((product) =>
      [
        product.name,
        product.description,
        Number(product.price),
        product.category || product.categoryRelation?.name || '',
        product.brand || '',
        Number(product.stock ?? 0),
        product.is_available ? 'true' : 'false',
        product.article || '',
        product.moderationStatus || '',
        JSON.stringify(product.specifications || {}),
        (product.images || []).join('|'),
      ]
        .map((cell) => this.escapeCsvCell(cell))
        .join(','),
    );

    const csvContent = [headers.map((h) => this.escapeCsvCell(h)).join(','), ...rows].join(
      '\n',
    );

    // BOM нужен для корректного отображения кириллицы в Excel на Windows.
    return `\uFEFF${csvContent}`;
  }

  async importAdminProductsFromCsv(
    user: Pick<User, 'id' | 'role'>,
    fileBuffer: Buffer,
  ) {
    const content = fileBuffer.toString('utf-8');
    const rows = this.parseCsv(content);

    if (!rows.length) {
      throw new BadRequestException('Файл импорта пуст');
    }

    let createdCount = 0;
    const errors: string[] = [];

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const line = index + 2;

      const name = row.name?.trim();
      const description = row.description?.trim();
      const price = Number(row.price);

      if (!name || !description || Number.isNaN(price)) {
        errors.push(
          `Строка ${line}: обязательны name, description и корректный price`,
        );
        continue;
      }

      let specifications: Record<string, unknown> = {};
      if (row.specifications_json?.trim()) {
        try {
          specifications = JSON.parse(row.specifications_json);
        } catch {
          errors.push(
            `Строка ${line}: specifications_json должен быть корректным JSON`,
          );
          continue;
        }
      }

      const stock = row.stock?.trim() ? Number(row.stock) : 0;
      if (Number.isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
        errors.push(`Строка ${line}: stock должен быть целым числом >= 0`);
        continue;
      }

      const images = row.images_pipe?.trim()
        ? row.images_pipe
            .split('|')
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

      const dto: CreateProductDto = {
        name,
        description,
        price,
        category: row.category?.trim() || '',
        brand: row.brand?.trim() || '',
        stock,
        article: row.article?.trim() || undefined,
        is_available: this.parseBoolean(row.is_available, true),
        specifications,
        images,
      };

      const created = await this.createProduct(dto, user);

      const moderationStatus = row.moderation_status?.trim().toLowerCase();
      if (
        this.isAdmin(user) &&
        ['draft', 'pending', 'approved', 'rejected'].includes(moderationStatus)
      ) {
        await this.productsRepository.update(created.id, {
          moderationStatus,
          moderationComment: null,
          moderatedAt: moderationStatus === 'approved' ? new Date() : null,
          moderatedById: moderationStatus === 'approved' ? user.id : null,
          is_available:
            moderationStatus === 'rejected' ? false : dto.is_available ?? true,
        });
      }

      createdCount += 1;
    }

    return {
      importedRows: rows.length,
      createdCount,
      errors,
    };
  }
}
