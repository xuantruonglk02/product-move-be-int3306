<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

-   Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
-   Website - [https://nestjs.com](https://nestjs.com/)
-   Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

## Todo list

### Auth module

-   [x] [Login](#login)

### User module

-   [x] [Get user detail](#get-user-detail)
-   [x] [Get user list]()
-   [x] [Update user](#update-user)

### Product module

-   [x] [Get product line detail](#get-product-line-detail)
-   [x] [Get product line list](#get-product-line-list)
-   [x] [Get product detail](#get-product-detail)
-   [x] [Get product list](#get-product-list)

### Admin module

-   [x] [Create user](#create-user)
-   [ ] Delete user (TODO: delete storage and inside products)
-   [x] [Create storage for producer and agency](#create-storage)
-   [x] [Create product line](#create-product-line)
-   [ ] View report (status | producer | agency | warranty center)

### Producer module

-   [x] [Get storage list](#get-producers-storage-list)
-   [x] [Create product](#create-product)
-   [x] [Export product to agency](#export-new-product-to-agency)
-   [ ] Receive error product from warranty center
-   [ ] Report about product (type | status) (month | quarter | year)
-   [ ] Report about sold product (month | quarter | year)
-   [ ] Report about error product (line | producer | agency)

### Agency module

-   [x] [Get storage list](#get-agencys-storage-list)
-   [x] Import new product from producer
-   [x] [Sold product](#checkout)
-   [ ] Receive error product from customer
-   [ ] Transfer error product to warranty center
-   [ ] Receive fixed product from warranty center
-   [ ] Return fixed product to customer
-   [ ] Return new product to customer
-   [ ] Report about product (line) (month | quarter | year)
-   [ ] Report about sold product (line) (month | quarter | year)
-   TODO: recall

### Warranty center module

-   [ ] Receive error product which still under warranty from agency
-   [ ] Return fixed product to agency
-   [ ] Notify agency that the product can not be fixed
-   [ ] Return error product to producer
-   [ ] Report about product (line | status) (month | quarter | year)

### Notification

-   TODO: Create notification for all actions

## API Documentation

### Auth module

#### Login

```http
POST /api/v1/auth/login
```

| Parameter  | Type     | Description  |
| :--------- | :------- | :----------- |
| `email`    | `string` | **Required** |
| `password` | `string` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "user": {
            "_id": "638b4b7718844a05965a0ca3",
            "email": "admin@productmove.com",
            "phoneNumber": "0123456789",
            "name": "Admin",
            "role": "admin",
            "avatar": "https://avatar.com"
        },
        "accessToken": "accessToken",
        "refreshToken": "refreshToken"
    },
    "version": "1.0.0"
}
```

### User module

#### Get user detail

```http
GET /api/v1/user/:id
```

| Parameter | Type       | Description  |
| :-------- | :--------- | :----------- |
| `id`      | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638b4b7718844a05965a0ca3",
        "email": "admin@productmove.com",
        "phoneNumber": "0123456789",
        "name": "Admin",
        "role": "admin",
        "avatar": "https://avatar.com"
    },
    "version": "1.0.0"
}
```

#### Get user list

```http
GET /api/v1/user
```

| Parameter        | Type     | Description                                                |
| :--------------- | :------- | :--------------------------------------------------------- |
| `page`           | `number` | **Optional**                                               |
| `limit`          | `number` | **Optional**                                               |
| `orderBy`        | `string` | **Optional**                                               |
| `orderDirection` | `string` | **Optional**. (in [ascending,descending])                  |
| `role`           | `string` | **Optional**. (in [admin,producer,agency,warranty_center]) |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "items": [
            {
                "_id": "638f8be6e5340b16eaef5a3e",
                "email": "agency@productmove.com",
                "phoneNumber": "0123456456",
                "name": "agency",
                "role": "agency",
                "avatar": "https://avatar.com"
            },
            {
                "_id": "638d69f4383b14090809a7e8",
                "email": "producer@productmove.com",
                "name": "producer",
                "role": "producer"
            },
            {
                "_id": "638b4b7718844a05965a0ca3",
                "email": "admin@productmove.com",
                "phoneNumber": "0123456789",
                "name": "Admin",
                "role": "admin",
                "avatar": "https://avatar.com"
            }
        ],
        "totalItems": 3
    },
    "version": "1.0.0"
}
```

#### Update user

```http
PATCH /api/v1/user/:id
```

| Parameter         | Type       | Description  |
| :---------------- | :--------- | :----------- |
| `id`              | `ObjectId` | **Required** |
| `confirmPassword` | `string`   | **Required** |
| `name`            | `string`   | **Optional** |
| `phoneNumber`     | `string`   | **Optional** |
| `avatar`          | `string`   | **Optional** |
| `password`        | `string`   | **Optional** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638b4b7718844a05965a0ca3",
        "email": "admin@productmove.com",
        "phoneNumber": "0123456789",
        "name": "Admin",
        "role": "admin",
        "avatar": "https://avatar.com"
    },
    "version": "1.0.0"
}
```

### Product module

#### Get product line detail

```http
GET /api/v1/product/product-line/:id
```

| Parameter | Type       | Description  |
| :-------- | :--------- | :----------- |
| `id`      | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638d6ba0f16ac5aff21e9969",
        "name": "Iphone",
        "price": 1000,
        "quantityOfProduct": 0
    },
    "version": "1.0.0"
}
```

#### Get product line list

```http
GET /api/v1/product/product-line
```

| Parameter        | Type     | Description                               |
| :--------------- | :------- | :---------------------------------------- |
| `keyword`        | `string` | **Optional**                              |
| `page`           | `number` | **Optional**                              |
| `limit`          | `number` | **Optional**                              |
| `orderBy`        | `string` | **Optional**                              |
| `orderDirection` | `string` | **Optional**. (in [ascending,descending]) |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "items": [
            {
                "_id": "638d6ba0f16ac5aff21e9969",
                "name": "Iphone",
                "price": 1000,
                "quantityOfProduct": 1
            },
            {
                "_id": "638d6bbce7f9bf2f085460c9",
                "name": "Iphone",
                "price": 1000,
                "quantityOfProduct": -56
            },
            {
                "_id": "639460a71db64de99f5f7111",
                "name": "Samsung",
                "price": 1000,
                "quantityOfProduct": 0
            }
        ],
        "totalItems": 3
    },
    "version": "1.0.0"
}
```

#### Get product detail

```http
GET /api/v1/product/:id
```

| Parameter | Type       | Description  |
| :-------- | :--------- | :----------- |
| `id`      | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "638d813b70c5c2e16b58e5dd",
        "createdAt": "2022-12-05T05:27:23.322Z",
        "updatedAt": "2022-12-05T05:27:23.322Z",
        "deletedAt": null,
        "createdBy": "638d69f4383b14090809a7e8",
        "updatedBy": null,
        "deletedBy": null,
        "productLineId": "638d6bbce7f9bf2f085460c9",
        "userId": "638d69f4383b14090809a7e8",
        "storageId": "638d809c085dd06475c5f016",
        "name": "Iphone 1",
        "description": "Iphone 1",
        "weight": 1000,
        "displaySize": 9.7,
        "bodySize": "1x1",
        "color": "black",
        "bodyBuild": "body build",
        "batteryVolume": 1000,
        "status": "new",
        "location": "in_producer",
        "sold": false,
        "__v": 0,
        "productLine": {
            "_id": "638d6bbce7f9bf2f085460c9",
            "createdAt": "2022-12-05T03:55:40.423Z",
            "updatedAt": "2022-12-05T05:27:23.327Z",
            "deletedAt": null,
            "createdBy": "638b4b7718844a05965a0ca3",
            "updatedBy": "638d69f4383b14090809a7e8",
            "deletedBy": null,
            "name": "Iphone",
            "price": 1000,
            "quantityOfProduct": 1,
            "__v": 0
        }
    },
    "version": "1.0.0"
}
```

#### Get product list

```http
GET /api/v1/product
```

| Parameter        | Type       | Description                               |
| :--------------- | :--------- | :---------------------------------------- |
| `productLineId`  | `ObjectId` | **Optional**                              |
| `keyword`        | `string`   | **Optional**                              |
| `page`           | `number`   | **Optional**                              |
| `limit`          | `number`   | **Optional**                              |
| `orderBy`        | `string`   | **Optional**                              |
| `orderDirection` | `string`   | **Optional**. (in [ascending,descending]) |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "items": [
            {
                "_id": "638d80b5085dd06475c5f01c",
                "productLineId": "638d6ba0f16ac5aff21e9969",
                "userId": "638d69f4383b14090809a7e8",
                "storageId": "638d809c085dd06475c5f016",
                "name": "Iphone 1",
                "description": "Iphone 1",
                "weight": 1000,
                "displaySize": 9.7,
                "bodySize": "1x1",
                "color": "black",
                "bodyBuild": "body build",
                "batteryVolume": 1000,
                "status": "new",
                "location": "in_producer",
                "sold": false
            },
            {
                "_id": "638d810770c5c2e16b58e5d8",
                "productLineId": "638d6ba0f16ac5aff21e9969",
                "userId": "638d69f4383b14090809a7e8",
                "storageId": "638d809c085dd06475c5f016",
                "name": "Iphone 1",
                "description": "Iphone 1",
                "weight": 1000,
                "displaySize": 9.7,
                "bodySize": "1x1",
                "color": "black",
                "bodyBuild": "body build",
                "batteryVolume": 1000,
                "status": "new",
                "location": "in_producer",
                "sold": false
            }
        ],
        "totalItems": 2
    },
    "version": "1.0.0"
}
```

### Admin module

#### Create user

```http
POST /api/v1/admin/user
```

| Parameter     | Type     | Description                                                |
| :------------ | :------- | :--------------------------------------------------------- |
| `email`       | `string` | **Required**                                               |
| `name`        | `string` | **Required**                                               |
| `role`        | `string` | **Required**. (in [admin,producer,agency,warranty_center]) |
| `password`    | `string` | **Required**                                               |
| `phoneNumber` | `string` | **Optional**                                               |
| `avatar`      | `string` | **Optional**                                               |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "createdAt": "2022-12-06T18:37:26.888Z",
        "updatedAt": "2022-12-06T18:37:26.888Z",
        "deletedAt": null,
        "createdBy": "638b4b7718844a05965a0ca3",
        "updatedBy": null,
        "deletedBy": null,
        "email": "agency@productmove.com",
        "phoneNumber": "0123456456",
        "name": "agency",
        "role": "agency",
        "avatar": "https://avatar.com",
        "_id": "638f8be6e5340b16eaef5a3e",
        "__v": 0
    },
    "version": "1.0.0"
}
```

#### Create storage

```http
POST /api/v1/admin/storage
```

| Parameter | Type       | Description  |
| :-------- | :--------- | :----------- |
| `userId`  | `ObjectId` | **Required** |
| `name`    | `string`   | **Required** |
| `address` | `string`   | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "createdAt": "2022-12-10T10:07:24.610Z",
        "updatedAt": "2022-12-10T10:07:24.610Z",
        "deletedAt": null,
        "createdBy": "638b4b7718844a05965a0ca3",
        "updatedBy": null,
        "deletedBy": null,
        "userId": "638f8be6e5340b16eaef5a3e",
        "name": "agency storage",
        "address": "agency storage",
        "_id": "63945a5c1db64de99f5f70ff",
        "__v": 0
    },
    "version": "1.0.0"
}
```

#### Create product line

```http
POST /api/v1/admin/product-line
```

| Parameter | Type     | Description  |
| :-------- | :------- | :----------- |
| `name`    | `string` | **Required** |
| `price`   | `number` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "createdAt": "2022-12-10T10:34:15.977Z",
        "updatedAt": "2022-12-10T10:34:15.977Z",
        "deletedAt": null,
        "createdBy": "638b4b7718844a05965a0ca3",
        "updatedBy": null,
        "deletedBy": null,
        "name": "Samsung",
        "price": 1000,
        "quantityOfProduct": 0,
        "_id": "639460a71db64de99f5f7111",
        "__v": 0
    },
    "version": "1.0.0"
}
```

### Producer module

#### Get producer's storage list

```http
POST /api/v1/agency/storage
```

| Parameter        | Type     | Description                               |
| :--------------- | :------- | :---------------------------------------- |
| `keyword`        | `string` | **Optional**                              |
| `page`           | `number` | **Optional**                              |
| `limit`          | `number` | **Optional**                              |
| `orderBy`        | `string` | **Optional**                              |
| `orderDirection` | `string` | **Optional**. (in [ascending,descending]) |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "items": [
            {
                "_id": "638d809c085dd06475c5f016",
                "userId": "638d69f4383b14090809a7e8",
                "name": "producer storage",
                "address": "producer storage"
            }
        ],
        "totalItems": 1
    },
    "version": "1.0.0"
}
```

#### Create product

```http
POST /api/v1/producer/product
```

| Parameter       | Type       | Description                               |
| :-------------- | :--------- | :---------------------------------------- |
| `productLineId` | `ObjectId` | **Required**                              |
| `storageId`     | `ObjectId` | **Required**                              |
| `name`          | `string`   | **Required**                              |
| `description`   | `string`   | **Required**                              |
| `weight`        | `number`   | **Required**. (in gram)                   |
| `displaySize`   | `number`   | **Required**. (in inch)                   |
| `bodySize`      | `string`   | **Required**                              |
| `color`         | `string`   | **Required**. (in [black,gray,red,white]) |
| `bodyBuild`     | `string`   | **Required**                              |
| `batteryVolume` | `number`   | **Required**. (in mAh)                    |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "createdAt": "2022-12-05T05:27:23.322Z",
        "updatedAt": "2022-12-05T05:27:23.322Z",
        "deletedAt": null,
        "createdBy": "638d69f4383b14090809a7e8",
        "updatedBy": null,
        "deletedBy": null,
        "productLineId": "638d6bbce7f9bf2f085460c9",
        "userId": "638d69f4383b14090809a7e8",
        "storageId": "638d809c085dd06475c5f016",
        "name": "Iphone 1",
        "description": "Iphone 1",
        "weight": 1000,
        "displaySize": 9.7,
        "bodySize": "1x1",
        "color": "black",
        "bodyBuild": "body build",
        "batteryVolume": 1000,
        "status": "new",
        "location": "in_producer",
        "sold": false,
        "_id": "638d813b70c5c2e16b58e5dd",
        "__v": 0
    }
    "version": "1.0.0"
}
```

#### Export new product to agency

```http
POST /api/v1/producer/export-to-agency
```

| Parameter    | Type              | Description  |
| :----------- | :---------------- | :----------- |
| `storageId`  | `ObjectId`        | **Required** |
| `agencyId`   | `ObjectId`        | **Required** |
| `productIds` | `Array<ObjectId>` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": [
        {
            "_id": "6394515a1d58e570ff3627db",
            "productId": "6394500b1d58e570ff3627cc",
            "previousUserId": "638d69f4383b14090809a7e8",
            "nextUserId": "638f8be6e5340b16eaef5a3e",
            "previousStorageId": "638d809c085dd06475c5f016",
            "previousStatus": "new",
            "nextStatus": "in_agency",
            "previousLocation": "in_producer",
            "nextLocation": "in_agency",
            "startDate": "2022-12-10T09:28:58.071Z",
            "createdBy": "638d69f4383b14090809a7e8",
            "createdAt": "2022-12-10T09:28:58.071Z"
        }
    ],
    "version": "1.0.0"
}
```

### Agency module

#### Get agency's storage list

```http
POST /api/v1/agency/storage
```

| Parameter        | Type     | Description                               |
| :--------------- | :------- | :---------------------------------------- |
| `keyword`        | `string` | **Optional**                              |
| `page`           | `number` | **Optional**                              |
| `limit`          | `number` | **Optional**                              |
| `orderBy`        | `string` | **Optional**                              |
| `orderDirection` | `string` | **Optional**. (in [ascending,descending]) |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "items": [
            {
                "_id": "63945a5c1db64de99f5f70ff",
                "userId": "638f8be6e5340b16eaef5a3e",
                "name": "agency storage",
                "address": "agency storage"
            }
        ],
        "totalItems": 1
    },
    "version": "1.0.0"
}
```

#### Checkout

```http
POST /api/v1/agency/checkout
```

| Parameter       | Type              | Description  |
| :-------------- | :---------------- | :----------- |
| `customerName`  | `string`          | **Required** |
| `customerEmail` | `string`          | **Required** |
| `customerPhone` | `string`          | **Required** |
| `productIds`    | `Array<ObjectId>` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "63945abf1db64de99f5f7106",
        "customerName": "customer",
        "customerEmail": "customer@gmail.com",
        "customerPhone": "0123456789",
        "orderDetails": [
            {
                "_id": "63945ac01db64de99f5f710b",
                "createdAt": "2022-12-10T10:09:03.984Z",
                "updatedAt": "2022-12-10T10:09:04.065Z",
                "deletedAt": null,
                "createdBy": "638f8be6e5340b16eaef5a3e",
                "updatedBy": null,
                "deletedBy": null,
                "orderId": "63945abf1db64de99f5f7106",
                "productId": "6394500b1d58e570ff3627cc",
                "productPrice": 1000,
                "__v": 0,
                "product": [
                    {
                        "_id": "6394500b1d58e570ff3627cc",
                        "createdAt": "2022-12-10T09:23:23.030Z",
                        "updatedAt": "2022-12-10T10:09:03.985Z",
                        "deletedAt": null,
                        "createdBy": "638d69f4383b14090809a7e8",
                        "updatedBy": "638f8be6e5340b16eaef5a3e",
                        "deletedBy": null,
                        "productLineId": "638d6bbce7f9bf2f085460c9",
                        "userId": null,
                        "storageId": null,
                        "name": "Iphone 1",
                        "description": "Iphone 1",
                        "status": "sold",
                        "location": "in_customer",
                        "sold": true,
                        "weight": 1000,
                        "displaySize": 9.7,
                        "bodySize": "1x1",
                        "color": "black",
                        "bodyBuild": "body build",
                        "batteryVolume": 1000,
                        "__v": 0,
                        "soldDate": "2022-12-10T10:09:03.984Z"
                    }
                ]
            }
        ]
    },
    "version": "1.0.0"
}
```
