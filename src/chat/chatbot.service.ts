import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { localisedStrings as english } from '../i18n/en/localised-strings';
import { LocalizationService } from '../localization/localization.service';

@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
  }

  public async processMessage(body: any): Promise<any> {
    try {
      const { from, text, button_response } = body;
      let botID = process.env.BOT_ID;
      let UserData = await this.userService.findUserByMobileNumber(from);

      if (!(UserData)){
        await this.userService.createUser(from,botID);
      }
      const userData = await this.userService.findUserByMobileNumber(from);
      const localisedStrings = await LocalizationService.getLocalisedString(
        userData.language,
      );

      if (!(button_response) && text.body === 'hi') {
        this.message.sendWelcomeMessage(from, userData.language);
        this.message.categoryButtons(from,userData.language);
      } 
      else if (button_response &&  (localisedStrings.category_list.includes(button_response.body)||localisedStrings.sub_category_list.includes(button_response.body))){
        let id = await this.message.getCategoryID(button_response.body,userData.language);
        console.log("id: ", id);
        const cardlength = await this.message.sendNewsAsArticleCarousel(
          userData.language,
          botID,
          from,
          id,
          button_response.body,
          1,
          2,
        );
        console.log("button_response: ",button_response.body);

        await this.message.sub_categoryButtons(from,userData.language,button_response.body);
      }
      return 'ok';
    } catch (error) {
      console.error('Error processing message:', error);
      throw error; // Re-throwing the error for global error handling if needed
    }
  }
}
