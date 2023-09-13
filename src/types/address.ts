import Countries from './countries';

interface IAddress {
    street: string;
    zipCode: string;
    city: string;
    country: Countries | string;
}

export default IAddress;
