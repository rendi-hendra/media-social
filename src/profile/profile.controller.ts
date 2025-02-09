import { Controller } from '@nestjs/common';
import { ProfileService } from './profile.service';

@Controller('/api/profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) {}
}
