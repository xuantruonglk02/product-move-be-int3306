import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import moment from 'moment';
import ConfigKey from 'src/common/config/configKey';
import { ReportTimeUnit } from 'src/common/constants';
import {
    makeCheckReportTimeConditions,
    makeReportTimeline,
} from 'src/common/helpers/utilityFunctions';
import { IProductReportUnit } from 'src/common/interfaces';
import { IReportProductQuery } from 'src/modules/producer/producer.interfaces';
import { IProductLine } from '../product.interfaces';
import { ProductLineDocument } from '../schemas/product-line.schema';
import { ProductDocument } from '../schemas/product.schema';

@Injectable()
export class ProductReportService {
    constructor(private readonly configService: ConfigService) {
        //
    }

    async makeProductReport(
        query: IReportProductQuery,
        products: ProductDocument[],
        productLines?: ProductLineDocument[],
        timezoneName = this.configService.get(ConfigKey.TIMEZONE_DEFAULT_NAME),
    ) {
        try {
            const reportTimeline = makeReportTimeline(
                query.startDate,
                query.finishDate,
                query.timeUnit,
            );

            const report: IProductReportUnit[] = reportTimeline.map((item) => ({
                time: item,
                productQuantity: {
                    total: 0,
                },
                // productLines: productLines
                //     ? productLines.map((line) => ({
                //           productLine: {
                //               _id: line._id,
                //               name: line.name,
                //           },
                //           quantity: 0,
                //       }))
                //     : undefined,
            }));

            const checkTimeConditions = makeCheckReportTimeConditions(
                report,
                query.timeUnit,
            );

            let reportLoopIndex = 0;
            products.forEach((product) => {
                const createdAt = moment
                    .utc(product.createdAt)
                    .tz(timezoneName);

                while (checkTimeConditions(createdAt, reportLoopIndex)) {
                    reportLoopIndex += 1;
                }

                report[reportLoopIndex].productQuantity.total =
                    report[reportLoopIndex].productQuantity.total + 1;

                if (productLines) {
                }
            });

            return report;
        } catch (error) {
            throw error;
        }
    }
}
