CXX = g++
CXXFLAGS = -std=c++17 -O3

LIBRARY = main.cpp base/base_system.cpp action/action.cpp calculation/calculation.cpp util/util.cpp

a: search/beam_search_and_yugeki/beam_search_and_yugeki.cpp search/beam_search_and_yugeki/evalation.cpp $(LIBRARY)
	$(CXX) $(CXXFLAGS) main.cpp search/beam_search_and_yugeki/beam_search_and_yugeki.cpp search/beam_search_and_yugeki/evalation.cpp $(LIBRARY)

clean:
	$(RM) *.out
