import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { LocalizationService } from '../localization/localization.service';
import { MessageService } from '../message/message.service';

dotenv.config();

interface Card {
  tags: string[];
  title: string;
  description: string;
  actions: {
    button_text: string;
    type: string;
    website: {
      title: string;
      payload: string;
      url: string;
    };
  }[];
  header?: {
    type: string;
    image: {
      url: string;
      body: string;
    };
  };
}

@Injectable()
export class SwiftchatMessageService extends MessageService {
  private botId = process.env.BOT_ID;
  private apiKey = process.env.API_KEY;
  private apiUrl = process.env.API_URL;
  private baseUrl = `${this.apiUrl}/${this.botId}/messages`;

  private prepareRequestData(from: string, requestBody: string): any {
    return {
      to: from,
      type: 'text',
      text: {
        body: requestBody,
      },
    };
  }
  async sendWelcomeMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.welcomeMessage,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async sendLanguageChangedMessage(from: string, language: string) {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const requestData = this.prepareRequestData(
      from,
      localisedStrings.select_language,
    );

    const response = await this.sendMessage(
      this.baseUrl,
      requestData,
      this.apiKey,
    );
    return response;
  }

  async categoryButtons(from: string, language: string): Promise<void> {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const url = `${this.apiUrl}/${this.botId}/messages`;
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localisedStrings.category_button_body,
          },
        },
        buttons: localisedStrings.category_buttons,
        allow_custom_response: false,
      },
    };
    try {
      const response = await axios.post(url, messageData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('errors:', error);
    }
  }

  async getCategoryID(categoryName: string, language: string): Promise<any> {
    const localisedStrings = await LocalizationService.getLocalisedString(language);

    const category = Object.entries(localisedStrings.categories).find(([key, value]) => key.toLowerCase() === categoryName.toLowerCase());
    return category ? category[1] : null;
  };

  async sub_categoryButtons(from: string, language: string, categoryName: string): Promise<void> {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const url = `${this.apiUrl}/${this.botId}/messages`;
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localisedStrings.category_button_body,
          },
        },
        buttons: localisedStrings[categoryName],
        allow_custom_response: false,
      },
    };
    try {
      const response = await axios.post(url, messageData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('response is: ',response.data)
      return response.data;
    } catch (error) {
      console.error('errors:', error);
    }
  }

  async goBackToMainMenu(from: string, language: string): Promise<void> {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const url = `${this.apiUrl}/${this.botId}/messages`;
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localisedStrings.backMainMenuMessage,
          },
        },
        buttons: localisedStrings.go_back_to_main_menu,
        allow_custom_response: false,
      },
    };
    try {
      const response = await axios.post(url, messageData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('errors:', error);
    }
  };

  async languageButtons(from: string, language: string): Promise<void> {
    const localisedStrings = LocalizationService.getLocalisedString(language);
    const url = `${this.apiUrl}/${this.botId}/messages`;
    const messageData = {
      to: from,
      type: 'button',
      button: {
        body: {
          type: 'text',
          text: {
            body: localisedStrings.languageBody,
          },
        },
        buttons: [
          {
            type: 'solid',
            body: 'Hindi',
            reply: 'Hindi',
          },
          {
            type: 'solid',
            body: 'English',
            reply: 'English',
          },
        ],
        allow_custom_response: false,
      },
    };
    try {
      const response = await axios.post(url, messageData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error('errors:', error);
    }
  }


}
