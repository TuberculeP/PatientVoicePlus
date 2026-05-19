import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { SubmitFormDto } from './dto/submit-form.dto.js'
import { FormsService } from './forms.service.js'

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Get()
  getForm() {
    return this.formsService.getThemesWithQuestions()
  }

  @Post()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @HttpCode(HttpStatus.CREATED)
  submitForm(@Body() dto: SubmitFormDto) {
    return this.formsService.submitForm(dto)
  }
}
