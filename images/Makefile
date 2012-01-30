.PHONY: all tour-arrows clean

all: tour-arrows

tour-arrows: \
	tour-up-arrow.png \
	tour-down-arrow.png \
	tour-left-arrow.png \
	tour-right-arrow.png

clean:
	rm -v \
		tour-up-arrow.png \
		tour-down-arrow.png \
		tour-left-arrow.png \
		tour-right-arrow.png

tour-up-arrow.png: tour-up-arrow.svg Makefile
	inkscape --export-area-page --export-png=$@ $<

tour-down-arrow.png: tour-up-arrow.png
	convert $< -flip $@

tour-left-arrow.png: tour-up-arrow.png
	convert $< -transpose $@

tour-right-arrow.png: tour-up-arrow.png
	convert $< -transverse $@
