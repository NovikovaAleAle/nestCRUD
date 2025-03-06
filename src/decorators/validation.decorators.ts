import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsNumberAndStringMatch(minimum: number, validationOptions: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNumberAndStringMatch',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [minimum],
      options: validationOptions,
      validator: {
        validate(value: any, arg: ValidationArguments) {
          if (typeof value === 'string' && value.match(/^[1-9]\d*$/) !== null) {
            if (parseInt(value) < arg.constraints[0]) {
              return false;
            } 
            return true;
          }
          if (typeof value === 'number'){
              return true;
          }        
          return false;
        },
      },
    });
  };
}