"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const identity_entity_1 = require("./identity.entity");
let IdentityService = class IdentityService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async register(dto) {
        const existing = await this.repo.findOne({ where: { email: dto.email } });
        if (existing) {
            throw new common_1.ConflictException('This email already exists');
        }
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(dto.password, salt);
        const identity = this.repo.create({ ...dto, password: hash });
        const saved = await this.repo.save(identity);
        const { password, ...rest } = saved;
        return rest;
    }
    async findByEmail(email) {
        if (!email)
            throw new common_1.NotFoundException(`User email was not specified`);
        const user = await this.repo.findOne({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        return user;
    }
    async findByEmailNoPass(email) {
        const user = await this.findByEmail(email);
        const { password, ...rest } = user;
        return rest;
    }
    async findAll() {
        const users = await this.repo.find();
        return users.map(({ password, ...rest }) => rest);
    }
    async findById(id) {
        if (!id)
            throw new common_1.NotFoundException(`User id was not specified`);
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User with id ${id} not found`);
        const { password, ...rest } = user;
        return rest;
    }
    async updateUser(id, dto) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (dto.password) {
            const salt = await bcrypt.genSalt();
            dto.password = await bcrypt.hash(dto.password, salt);
        }
        Object.assign(user, dto);
        const saved = await this.repo.save(user);
        const { password, ...rest } = saved;
        return rest;
    }
    async toggleStatus(id) {
        const user = await this.repo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.status = !user.status;
        const saved = await this.repo.save(user);
        const { password, ...rest } = saved;
        return rest;
    }
};
exports.IdentityService = IdentityService;
exports.IdentityService = IdentityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(identity_entity_1.Identity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], IdentityService);
//# sourceMappingURL=identity.service.js.map