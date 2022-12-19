import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dtos/create-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;

    return this.repo.save(report);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOneBy({ id: parseInt(id) });

    if (!report) {
      throw new NotFoundException('Record was not found');
    }

    report.approved = approved;
    await this.repo.save(report);

    return report;
  }

  async createEstimate(estimateDto: GetEstimateDto) {
    const { make, model, mileage, year, lat, lng } = estimateDto;

    const estimatedPrice = await this.repo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .getRawOne();

    if (!estimatedPrice.price) {
      throw new NotFoundException(
        "We don't have enough information in our database to estimate the value of your car just yet.",
      );
    }

    return estimatedPrice;
  }
}
