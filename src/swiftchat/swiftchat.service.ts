import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { LocalizationService } from 'src/localization/localization.service';
import { MessageService } from 'src/message/message.service';

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

  private getArticleDescription = (
    userLanguage: string,
    article: any,
  ): string => {
    if (userLanguage === 'English') {
      return article.yoast_head_json.description.replace(/<\/?p>/g, '');
    } else {
      return article.excerpt.rendered.replace(/<\/?p>/g, '');
    }
  };

  private getArticleTitle = (userLanguage: string, article: any): string => {
    const maxLength = 100;
    if (userLanguage === 'English') {
      return article.slug.length > maxLength
        ? article.slug.substring(0, maxLength - 3) + '...'
        : article.slug;
    } else {
      return article.title.rendered.length > maxLength
        ? article.title.rendered.substring(0, maxLength - 3) + '...'
        : article.title.rendered;
    }
  };

  // async sendNewsAsArticleCarousel(
  //   language: string,
  //   botId: string,
  //   recipientMobile: string,
  //   Tags: string,
  //   articlesPerPage: number,
  // ): Promise<number> {
  //   try {
  //     console.log(language);
  //     console.log(botId);
  //     console.log(recipientMobile);
  //     console.log(Tags);
  //     console.log(articlesPerPage);
  //     let url = `https://gnews.io/api/v4/search?q=Sports and activities&lang=${language}&country=in&max=10&token=d2c7df631f993f515d8a6e675da5fdd2`;
  //     console.log(url);
  //     let cards: Card[] = [];


  //     const response = await axios.get(url);
  //     const articles = response.data;

  //     console.log('Article is: ', articles.length);

  //     if (articles.length === 0) {
  //       console.log('No news articles found.');
  //       return 0;
  //     };


  //     const truncatedTags = Tags.substring(0, 20);
  //     for (let i = 0; i < +articles.length; i++) {
  //       const article = articles[i];
  //       const thumbnailUrl = encodeURI(
  //         article.yoast_head_json?.og_image?.[0]?.url ||
  //           'https://khabrimedia.com/wp-content/uploads/2023/06/khabri-media-1.png',
  //       );
  //       const hasWebpExtension = thumbnailUrl?.endsWith('.webp');
  //       const truncatedTitle = this.getArticleTitle(language, article);

  //       const cleanedString = this.getArticleDescription(language, article);
  //       const card: Card = {
  //         tags: [truncatedTags],
  //         title: truncatedTitle,
  //         description: cleanedString,
  //         actions: [
  //           {
  //             button_text: 'Read More',
  //             type: 'website',
  //             website: {
  //               title: 'Read More',
  //               payload: article.link,
  //               url: article.link,
  //             },
  //           },
  //         ],
  //       };

  //       if (!hasWebpExtension) {
  //         card.header = {
  //           type: 'image',
  //           image: {
  //             url: thumbnailUrl,
  //             body: 'Sample caption',
  //           },
  //         };
  //       }

  //       cards.push(card);

  //       if (cards.length >= articlesPerPage) {
  //         break;
  //       }
  //     }

  //     // await this.redisService.set(url, JSON.stringify(cards));

  //     try {
  //       const cardMessageData = {
  //         to: recipientMobile,
  //         type: 'article',
  //         article: cards,
  //       };

  //       await axios.post(
  //         `https://v1-api.swiftchat.ai/api/bots/${botId}/messages`,
  //         cardMessageData,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${this.apiKey}`,
  //           },
  //         },
  //       );
  //     } catch (error) {
  //       console.log('error: ', error);
  //       // this.handleApiError(error);
  //     }

  //     return cards.length;
  //   } catch (error) {
  //     console.log('Error fetching and sending news as a card carousel:', error);
  //     return 0;
  //   }
  // }
}
