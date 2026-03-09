import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokeModel: Model<Pokemon>
  ) { }

  private readonly axios: AxiosInstance = axios;

  // async executeSeed() {

  //   let col: any[] = [];

  //   const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

  //   data.results.forEach(({ name, url }) => {
  //     const segments = url.split('/');
  //     const no: number = +segments[segments.length - 2];
  //     col.push({ name, no });
  //     this.create({ name, no });
  //   });

  //   return col;
  // };


  // async create(createPokemonDto: CreatePokemonDto) {

  //   try {
  //     createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
  //     const pokemon = await this.pokeModel.create(createPokemonDto)
  //     return pokemon;

  //   } catch (error) {

  //     this.handleExceptions(error);

  //   }
  // };

  // private handleExceptions(error: any) {

  //   if (error.code === 11000) { throw new BadRequestException(`Pokemon exist en DB error: ${JSON.stringify(error.keyValue)}`) };
  //   console.log(error);
  //   throw new InternalServerErrorException(`Can't create Pokemon. - Check server logs`)

  // }

  // async executeSeed() {

  //   await this.pokeModel.deleteMany(); // Ojo, borra todos los registros de la DB.

  //   let insertPromiseArray: any[] = [];

  //   const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');

  //   data.results.forEach(({ name, url }) => {
  //     const segments = url.split('/');
  //     const no: number = +segments[segments.length - 2];
  //     insertPromiseArray.push(
  //       this.pokeModel.create({ name, no })
  //     );
  //   });

  //   await Promise.all(insertPromiseArray);

  //   return 'Seed Executed';
  // };


  async executeSeed() {

    await this.pokeModel.deleteMany(); // Ojo, borra todos los registros de la DB.

    let pokemonToInsert: { name, no }[] = [];

    const { data } = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];
      pokemonToInsert.push({ name, no });
    });

    await this.pokeModel.insertMany(pokemonToInsert);

    return 'Seed Executed';
  };
}
