import { Injectable } from '@nestjs/common';
import IntentClassifier from '../intent/intent.classifier';
import { MessageService } from 'src/message/message.service';
import { UserService } from 'src/model/user.service';
import { localisedStrings as english } from '../i18n/en/localised-strings';
import { LocalizationService } from '../localization/localization.service';
import { KhabriMediaNewsService } from 'src/khabriMedia/newsFetching';
@Injectable()
export class ChatbotService {
  private readonly intentClassifier: IntentClassifier;
  private readonly message: MessageService;
  private readonly userService: UserService;
  private readonly khabriMediaNewsService: KhabriMediaNewsService;

  constructor(
    intentClassifier: IntentClassifier,
    message: MessageService,
    userService: UserService,
    khabriMediaService: KhabriMediaNewsService,
  ) {
    this.intentClassifier = intentClassifier;
    this.message = message;
    this.userService = userService;
    this.khabriMediaNewsService = khabriMediaService;
  }

  public async processMessage(body: any): Promise<any> {
    try {
      const { from, text, button_response, persistent_menu_response } = body;
      let botID = process.env.BOT_ID;
      let UserData = await this.userService.findUserByMobileNumber(from);

      if (!UserData) {
        await this.userService.createUser(from, botID);
      }
      const userData = await this.userService.findUserByMobileNumber(from);
      const localisedStrings = await LocalizationService.getLocalisedString(
        userData.language,
      );

      if (!persistent_menu_response && !button_response && text.body === 'hi') {
        this.message.sendWelcomeMessage(from, userData.language);
        this.message.categoryButtons(from, userData.language);
      } else if (
        button_response &&
        (localisedStrings.category_list.includes(button_response.body) ||
          localisedStrings.sub_category_list.includes(button_response.body))
      ) {
        if (localisedStrings.category_list.includes(button_response.body)) {
          let id = await this.message.getCategoryID(
            button_response.body,
            userData.language,
          );
          await this.khabriMediaNewsService.sendNewsAsArticleCarousel(
            userData.language,
            botID,
            from,
            id,
            button_response.body,
            english.articleNumbers[0],
            english.articleNumbers[1],
          );
          await this.message.sub_categoryButtons(
            from,
            userData.language,
            button_response.body,
          );
          await this.userService.saveButtonResponse(
            from,
            botID,
            button_response.body,
          );
        } else if (
          localisedStrings.sub_category_list.includes(button_response.body)
        ) {
          let id = await this.message.getCategoryID(
            button_response.body,
            userData.language,
          );
          await this.khabriMediaNewsService.sendNewsAsArticleCarousel(
            userData.language,
            botID,
            from,
            id,
            button_response.body,
            english.articleNumbers[0],
            english.articleNumbers[1],
          );
          await this.message.goBackToMainMenu(from, userData.language);
        }
      } else if (
        button_response &&
        localisedStrings.back_to_main_menu.includes(button_response.body)
      ) {
        if (button_response.body === localisedStrings.back_to_main_menu[0]) {
          this.message.categoryButtons(from, userData.language);
        } else if (
          button_response.body === localisedStrings.back_to_main_menu[1]
        ) {
          await this.message.sub_categoryButtons(
            from,
            userData.language,
            userData.buttonResponse,
          );
        }
      } else if (persistent_menu_response) {
        await this.message.languageButtons(from, userData.language);
      } else if (
        button_response &&
        localisedStrings.languageButtons.includes(button_response.body)
      ) {
        console.log("Yes");
        await this.userService.saveLanguage(from, botID, button_response.body);
        console.log("Done");
        await this.message.categoryButtons(from, button_response.body);
        console.log("Buttons saved")
      }
      return 'ok';
    } catch (error) {
      console.error('Error processing message:', error);
      throw error; // Re-throwing the error for global error handling if needed
    }
  }
}
