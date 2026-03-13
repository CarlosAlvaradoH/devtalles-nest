import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';

import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Pokemon } from './entities/pokemon.entity';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

@Injectable()
export class PokemonService {

  defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokeModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit')!
  }

  async create(createPokemonDto: CreatePokemonDto) {

    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
      const pokemon = await this.pokeModel.create(createPokemonDto)
      return pokemon;

    } catch (error) {

      this.handleExceptions(error);

    }
  }

  findAll(paginationDto: PaginationDto) {

    const { limit = this.defaultLimit, offset = 0 } = paginationDto;

    return this.pokeModel.find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v')
  }

  async findOne(term: string) {

    let pokemon: Pokemon | null = null;

    if (!isNaN(+term)) {
      pokemon = await this.pokeModel.findOne({ no: Number(term) })
    };

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokeModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokeModel.findOne({ name: term.toLowerCase().trim() })
    };

    if (!pokemon) throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {


    const pokemon = await this.findOne(term);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {

      await pokemon.updateOne(updatePokemonDto, { new: true });

      return { ...pokemon.toJSON(), ...updatePokemonDto };

    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = await this.pokeModel.findByIdAndDelete(id);
    const { deletedCount } = await this.pokeModel.deleteOne({ _id: id });

    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id: ${id}, not found.`)
    }
    return
  }

  private handleExceptions(error: any) {

    if (error.code === 11000) { throw new BadRequestException(`Pokemon exist en DB error: ${JSON.stringify(error.keyValue)}`) };
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon. - Check server logs`)

  }
}
