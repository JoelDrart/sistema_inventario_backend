import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CategoriasResponseDto,
  CreateProductoDto,
  FilterProductoDto,
  ProductoResponseDto,
} from './dto';
import { StockProductoBodegaDto } from 'src/stock/dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('')
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createProductDto: CreateProductoDto,
    @UploadedFile() imageFile?: Express.Multer.File,
  ): Promise<ProductoResponseDto> {
    return this.productService.create(createProductDto, imageFile);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(@Param('id') id: string, @Body() updateProductDto: CreateProductoDto) {
    return this.productService.update(id, updateProductDto);
  }

  @Get()
  findAll(@Query() filterDto: FilterProductoDto): Promise<ProductoResponseDto> {
    return this.productService.findAll(filterDto);
  }
  @Get('categorias')
  getCategorias(): Promise<CategoriasResponseDto> {
    return this.productService.getCategorias();
  }
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductoResponseDto> {
    return this.productService.findOneById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<ProductoResponseDto> {
    return this.productService.delete(id);
  }

  @Post('/stock')
  createStock(@Body() stock: StockProductoBodegaDto) {
    return this.productService.createStock(stock);
  }
}
