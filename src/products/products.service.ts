import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { CreateProductDto, UpdateProductDto } from './dto';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database Connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data : createProductDto
    });
  }

  async findAll( paginationDto : PaginationDto ) {
    const { page, limit } = paginationDto;

    const totalPage = await this.product.count({ where : { available : true }});

    const lastPage = Math.ceil( totalPage / limit );

    return {
      data : await this.product.findMany({
        skip : ( page - 1 ) * limit,
        take : limit,
        where : { 
          available : true 
        }
      }),
      meta : {
        total : totalPage,
        page : page,
        lastPage : lastPage
      }
    }
  }

  async findOne(id: number) {
    const product = await this.product.findFirst({ 
      where : { id, available: true } 
    });

    if ( !product )
      throw new RpcException({
        status : HttpStatus.BAD_REQUEST,
        message : `Producto con el id #${id} no existe`
      });

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const {id:_, ...data  } = updateProductDto;
    
    await this.findOne( id );

    return this.product.update({
      where : { id },
      data : data
    });
  }

  async remove(id: number) {
    await this.findOne( id );

    const product = await this.product.update({
      where : { id },
      data : { 
        available : false
      }
    });
    // return this.product.delete({ where: { id } });  //elimina completamente
  }

  async validateProducts( ids : number[] ){

    ids = Array.from(new Set(ids)); //ningun duplicado

    const products = await this.product.findMany({
      where: {
        id : {
          in : ids
        }
      }
    });

    if ( products.length !== ids.length ) {
      throw new RpcException({
        message : 'Some products were not found',
        status :  HttpStatus.BAD_REQUEST
      });
    }

    return products;
  }
}
