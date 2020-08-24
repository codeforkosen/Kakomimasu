#pragma once
#include "../base/base_system.hpp"

#include <ostream>
#include <utility>

std::vector<std::vector<Action>> enumerate_agent_moves(const TurnInfo& turn_info);
