// SPDX-FileCopyrightText: 2024 German Aerospace Center (DLR)
// SPDX-License-Identifier: Apache-2.0

import {setupServer} from 'msw/node';
import handlers from './handlers';

export default setupServer(...handlers);
