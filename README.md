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
-   [x] [Get user list](#get-user-list)
-   [x] [Update user](#update-user)

### Storage module

-   [x] [Get storage list](#get-storage-list)

### Product module

-   [x] [Get product line detail](#get-product-line-detail)
-   [x] [Get product line list](#get-product-line-list)
-   [x] [Get product detail](#get-product-detail)
-   [x] [Get product list](#get-product-list)

### Admin module

-   [x] [Create user](#create-user)
-   [ ] [Delete user](#delete-user)
    -   [x] Delete user
    -   [ ] Delete own storages
    -   [ ] Delete inside products
-   [x] [Create storage for producer and agency](#create-storage)
-   [x] [Create product line](#create-product-line)
-   [ ] View report (status | producer | agency | warranty center)

### Producer module

-   [x] [create storage](#producer-create-storage)
-   [x] [Create product](#create-product)
-   [x] [Export product to agency](#export-new-product-to-agency)
-   [ ] Receive error product from warranty center
-   [ ] Report about product (type | status) (month | quarter | year)
-   [ ] Report about sold product (month | quarter | year)
-   [ ] Report about error product (line | producer | agency)

### Agency module

-   [x] [Create storage](#agency-create-storage)
-   [x] [Import new product from producer](#import-new-product-from-producer)
-   [x] [Sold product](#checkout)
-   [x] [Receive error product from customer](#receive-error-product-from-customer)
-   [x] [Transfer error product to warranty center](#transfer-error-product-to-warranty-center)
-   [ ] Receive fixed product from warranty center
-   [ ] Return fixed product to customer
-   [ ] Return new product to customer
-   [ ] Report about product (line) (month | quarter | year)
-   [ ] Report about sold product (line) (month | quarter | year)
-   TODO: recall

### Warranty center module

-   [x] [Receive error product which still under warranty from agency](#receive-error-product-from-agency)
-   [ ] Verify product errors fixed done
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

| Path Variables | Type       |
| :------------- | :--------- |
| `id`           | `ObjectId` |

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

| Path Variables | Type       |
| :------------- | :--------- |
| `id`           | `ObjectId` |

| Parameter         | Type     | Description  |
| :---------------- | :------- | :----------- |
| `confirmPassword` | `string` | **Required** |
| `name`            | `string` | **Optional** |
| `phoneNumber`     | `string` | **Optional** |
| `avatar`          | `string` | **Optional** |
| `password`        | `string` | **Optional** |

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

### Storage module

#### Get storage list

```http
GET /api/v1/storage
```

| Parameter        | Type       | Description                               |
| :--------------- | :--------- | :---------------------------------------- |
| `page`           | `number`   | **Optional**                              |
| `limit`          | `number`   | **Optional**                              |
| `orderBy`        | `string`   | **Optional**                              |
| `orderDirection` | `string`   | **Optional**. (in [ascending,descending]) |
| `keyword`        | `string`   | **Optional**                              |
| `userId`         | `ObjectId` | **Optional**                              |

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
            },
            {
                "_id": "63a81384157ef2658cdfe5b6",
                "userId": "638f8be6e5340b16eaef5a3e",
                "name": "agency storage 2",
                "address": "agency storage 2"
            },
            {
                "_id": "638d809c085dd06475c5f016",
                "userId": "638d69f4383b14090809a7e8",
                "name": "producer storage",
                "address": "producer storage"
            }
        ],
        "totalItems": 3
    },
    "version": "1.0.0"
}
```

### Product module

#### Get product line detail

```http
GET /api/v1/product/product-line/:id
```

| Path Variables | Type       |
| :------------- | :--------- |
| `id`           | `ObjectId` |

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

| Path Variables | Type       |
| :------------- | :--------- |
| `id`           | `ObjectId` |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
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
        "sold": false,
        "productLine": {
            "_id": "638d6ba0f16ac5aff21e9969",
            "name": "Iphone",
            "price": 1000
        },
        "user": {
            "_id": "638d69f4383b14090809a7e8",
            "email": "producer@productmove.com",
            "name": "producer"
        },
        "storage": {
            "_id": "638d809c085dd06475c5f016",
            "name": "producer storage",
            "address": "producer storage"
        },
        "createdBy": {
            "_id": "638d69f4383b14090809a7e8",
            "email": "producer@productmove.com",
            "name": "producer"
        },
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
| `createdBy`      | `ObjectId` | **Optional**                              |
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
                "_id": "63a88b0b7cfcda0928b81419",
                "productLineId": "639460a71db64de99f5f7111",
                "userId": "638d69f4383b14090809a7e8",
                "storageId": "638d809c085dd06475c5f016",
                "name": "56736d617274204a6f792034",
                "description": "Iphone 1",
                "status": "new",
                "location": "in_producer",
                "sold": false,
                "weight": 1000,
                "displaySize": 9.7,
                "bodySize": "1x1",
                "color": "black",
                "bodyBuild": "body build",
                "batteryVolume": 1000,
                "productLine": {
                    "_id": "639460a71db64de99f5f7111",
                    "name": "Samsung",
                    "price": 1000
                },
                "user": {
                    "_id": "638d69f4383b14090809a7e8",
                    "email": "producer@productmove.com",
                    "name": "producer"
                },
                "storage": {
                    "_id": "638d809c085dd06475c5f016",
                    "name": "producer storage",
                    "address": "producer storage"
                }
                "createdBy": {
                    "_id": "638d69f4383b14090809a7e8",
                    "email": "producer@productmove.com",
                    "name": "producer"
                },
            },
        ],
        "totalItems": 1
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

#### Delete user

```http
DELETE /api/v1/admin/user/:id
```

| Path Variables | Type       |
| :------------- | :--------- |
| `id`           | `ObjectId` |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "63a9ed8d2b42b26df3f4be87",
        "email": "warrantyy@productmove.com",
        "phoneNumber": "0123456456",
        "name": "warranty center",
        "role": "warranty_center",
        "avatar": "https://avatar.com"
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

#### Producer create storage

```http
POST /api/v1/producer/storage
```

| Parameter | Type     | Description  |
| :-------- | :------- | :----------- |
| `name`    | `string` | **Required** |
| `address` | `string` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "createdAt": "2022-12-25T09:12:21.504Z",
        "updatedAt": "2022-12-25T09:12:21.504Z",
        "deletedAt": null,
        "createdBy": "638d69f4383b14090809a7e8",
        "updatedBy": null,
        "deletedBy": null,
        "userId": "638d69f4383b14090809a7e8",
        "name": "producer storage 3",
        "address": "producer storage 3",
        "_id": "63a813f55b89e87de7d9f28f",
        "__v": 0
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

| Parameter         | Type              | Description  |
| :---------------- | :---------------- | :----------- |
| `agencyId`        | `ObjectId`        | **Required** |
| `agencyStorageId` | `ObjectId`        | **Required** |
| `productIds`      | `Array<ObjectId>` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "63a6db965cf7d23d50149281",
        "previousUserId": "638d69f4383b14090809a7e8",
        "nextUserId": "638f8be6e5340b16eaef5a3e",
        "previousStorageId": "638d809c085dd06475c5f016",
        "nextStorageId": "63945a5c1db64de99f5f70ff",
        "productIds": [
            "638d80b5085dd06475c5f01c"
        ],
        "previousStatus": "new",
        "nextStatus": "in_agency",
        "previousLocation": "in_producer",
        "nextLocation": "in_agency",
        "startDate": "2022-12-24T10:59:34.578Z"
    },
    "version": "1.0.0"
}
```

### Agency module

#### Agency create storage

```http
POST /api/v1/agency/storage
```

| Parameter | Type     | Description  |
| :-------- | :------- | :----------- |
| `name`    | `string` | **Required** |
| `address` | `string` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "createdAt": "2022-12-10T10:07:24.610Z",
        "updatedAt": "2022-12-10T10:07:24.610Z",
        "deletedAt": null,
        "createdBy": "638f8be6e5340b16eaef5a3e",
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

#### Import new product from producer

```http
POST /api/v1/agency/import-new-product
```

| Parameter      | Type       | Description  |
| :------------- | :--------- | :----------- |
| `transitionId` | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "63a6db965cf7d23d50149281",
        "previousUserId": "638d69f4383b14090809a7e8",
        "nextUserId": "638f8be6e5340b16eaef5a3e",
        "previousStorageId": "638d809c085dd06475c5f016",
        "nextStorageId": "63945a5c1db64de99f5f70ff"
        "productIds": [
            "638d80b5085dd06475c5f01c"
        ],
        "previousStatus": "new",
        "nextStatus": "in_agency",
        "previousLocation": "in_producer",
        "nextLocation": "in_agency",
        "startDate": "2022-12-24T10:59:34.578Z",
        "finishDate": "2022-12-24T11:07:24.878Z",
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

#### Receive error product from customer

```http
POST /api/v1/agency/receive-error-product
```

| Parameter          | Type       | Description  |
| :----------------- | :--------- | :----------- |
| `productId`        | `ObjectId` | **Required** |
| `errorDescription` | `string`   | **Required** |
| `agencyStorageId`  | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "product": {
            "_id": "638d80b5085dd06475c5f01c",
            "productLineId": "638d6ba0f16ac5aff21e9969",
            "userId": "638f8be6e5340b16eaef5a3e",
            "storageId": "63945a5c1db64de99f5f70ff",
            "name": "Iphone 1",
            "description": "Iphone 1",
            "weight": 1000,
            "displaySize": 9.7,
            "bodySize": "1x1",
            "color": "black",
            "bodyBuild": "body build",
            "batteryVolume": 1000,
            "status": "need_warranty",
            "location": "in_agency",
            "sold": true,
            "soldDate": "2022-12-24T11:12:05.676Z"
        },
        "report": {
            "_id": "63a9ea742b42b26df3f4be6c",
            "productId": "638d80b5085dd06475c5f01c",
            "description": "error"
        }
    },
    "version": "1.0.0"
}
```

#### Transfer error product to warranty center

```http
POST /api/v1/agency/transfer-error-product
```

| Parameter          | Type              | Description  |
| :----------------- | :---------------- | :----------- |
| `warrantyCenterId` | `ObjectId`        | **Required** |
| `productIds`       | `Array<ObjectId>` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "63a9eb812b42b26df3f4be7e",
        "previousUserId": "638f8be6e5340b16eaef5a3e",
        "nextUserId": "63a9eb312b42b26df3f4be75",
        "previousStorageId": "63945a5c1db64de99f5f70ff",
        "nextStorageId": null,
        "productIds": [
            "638d80b5085dd06475c5f01c"
        ],
        "previousStatus": "need_warranty",
        "nextStatus": "in_warranty",
        "previousLocation": "in_agency",
        "nextLocation": "in_warranty_center",
        "startDate": "2022-12-26T18:44:17.082Z"
    },
    "version": "1.0.0"
}
```

### Warranty Center module

#### Receive error product from agency

```http
POST /api/v1/warranty-center/receive-error-product
```

| Parameter      | Type       | Description  |
| :------------- | :--------- | :----------- |
| `transitionId` | `ObjectId` | **Required** |

```javascript
{
    "success": true,
    "code": 200,
    "message": "Success",
    "data": {
        "_id": "63a9eb812b42b26df3f4be7e",
        "previousUserId": "638f8be6e5340b16eaef5a3e",
        "nextUserId": "63a9eb312b42b26df3f4be75",
        "previousStorageId": "63945a5c1db64de99f5f70ff",
        "nextStorageId": null,
        "productIds": [
            "638d80b5085dd06475c5f01c"
        ],
        "previousStatus": "need_warranty",
        "nextStatus": "in_warranty",
        "previousLocation": "in_agency",
        "nextLocation": "in_warranty_center",
        "startDate": "2022-12-26T18:44:17.082Z",
        "finishDate": "2022-12-26T19:54:24.247Z"
    },
    "version": "1.0.0"
}
```
