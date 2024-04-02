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
    const { from, text, button_response } = body;
    console.log(button_response);
    let botID = process.env.BOT_ID;
    let UserData = await this.userService.findUserByMobileNumber(from);
    console.log("UserData: ",UserData);

    if (!(UserData)){
      console.log("true----");
      console.log(typeof(from));
      await this.userService.createUser(from,botID);
    }
    const userData = await this.userService.findUserByMobileNumber(from);
    const localisedStrings = LocalizationService.getLocalisedString(
      userData.language,
    );

    if (!(button_response) && text.body === 'hi') {
      this.message.sendWelcomeMessage(from, userData.language);
      this.message.categoryButtons(from,userData.language);
    } 
    else if (button_response &&  localisedStrings.category_list.includes(button_response.body)){
      console.log("button response true");
      // const cardlength = await this.message.sendNewsAsArticleCarousel(
      //   userData.language,
      //   botID,
      //   from,
      //   button_response.body,
      //   1,
      // );
    }
    return 'ok';
  }
}
export default ChatbotService;
