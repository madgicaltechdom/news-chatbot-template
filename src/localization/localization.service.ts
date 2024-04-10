import { Injectable } from '@nestjs/common';
import { localisedStrings as english } from '../i18n/en/localised-strings';
import { localisedStrings as hindi } from '../i18n/hn/localised-strings';

@Injectable()
export class LocalizationService {
  static getLocalisedString = (language): any => {
    if (language == 'Hindi') {
      return hindi;
    } else if(language === 'English') {
      return english;
    }
  };
}
